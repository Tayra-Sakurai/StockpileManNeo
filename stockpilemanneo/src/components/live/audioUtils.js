/**
 * @fileoverview Audio utilities for Gemini Live voice input and output.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts Int16 PCM byte buffer to Float32Array (-1.0 to 1.0).
 * @param {ArrayBuffer} buffer
 * @returns {Float32Array}
 */
export function pcm16ToFloat32(buffer) {
  const int16 = new Int16Array(buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

/**
 * Converts Float32Array to 16-bit PCM ArrayBuffer.
 * @param {Float32Array} input
 * @returns {ArrayBuffer}
 */
export function float32ToPcm16(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output.buffer;
}

/**
 * Downsamples audio buffer from source sample rate to target sample rate.
 * @param {Float32Array} buffer
 * @param {number} fromRate
 * @param {number} toRate
 * @returns {Float32Array}
 */
export function downsampleBuffer(buffer, fromRate, toRate) {
  if (fromRate === toRate) {
    return buffer;
  }
  const ratio = fromRate / toRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

/**
 * Class to capture microphone audio and convert to 16kHz PCM chunks for Gemini Live.
 */
export class AudioRecorder {
  /**
   * @param {object} options
   * @param {(base64Audio: string) => void} options.onAudioData Callback receiving base64 PCM 16kHz chunks.
   * @param {(volume: number) => void} [options.onVolumeChange] Callback receiving volume level (0.0 - 1.0).
   */
  constructor({ onAudioData, onVolumeChange }) {
    this.onAudioData = onAudioData;
    this.onVolumeChange = onVolumeChange;
    /** @type {AudioContext | null} */
    this.audioContext = null;
    /** @type {MediaStream | null} */
    this.mediaStream = null;
    /** @type {ScriptProcessorNode | null} */
    this.processorNode = null;
    /** @type {MediaStreamAudioSourceNode | null} */
    this.sourceNode = null;
    /** @type {AnalyserNode | null} */
    this.analyserNode = null;
    this.isRecording = false;
    this.muted = false;
    this._animationFrameId = null;
  }

  /**
   * Starts recording from user microphone.
   */
  async start() {
    if (this.isRecording) return;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 512;
    this.analyserNode.smoothingTimeConstant = 0.4;

    // Buffer size 2048 or 4096 gives optimal balance between latency and packet overhead
    const bufferSize = 2048;
    this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.processorNode.onaudioprocess = (e) => {
      if (!this.isRecording || this.muted) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const sourceRate = this.audioContext.sampleRate;
      const targetRate = 16000;

      // Downsample to 16kHz PCM
      const downsampled = downsampleBuffer(inputData, sourceRate, targetRate);
      const pcm16Buffer = float32ToPcm16(downsampled);
      const base64Chunk = arrayBufferToBase64(pcm16Buffer);

      if (this.onAudioData) {
        this.onAudioData(base64Chunk);
      }
    };

    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.processorNode);
    // Connect to destination to keep processor node running (silent)
    this.processorNode.connect(this.audioContext.destination);

    this.isRecording = true;
    this._startVolumePolling();
  }

  _startVolumePolling() {
    if (!this.analyserNode || !this.onVolumeChange) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    const update = () => {
      if (!this.isRecording) return;

      if (this.muted) {
        this.onVolumeChange(0);
      } else if (this.analyserNode) {
        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 128);
        this.onVolumeChange(normalized);
      }

      this._animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Sets microphone mute state.
   * @param {boolean} isMuted
   */
  setMute(isMuted) {
    this.muted = isMuted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }

  /**
   * Stops recording and releases all audio resources.
   */
  stop() {
    this.isRecording = false;

    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }

    if (this.onVolumeChange) {
      this.onVolumeChange(0);
    }

    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/**
 * Class to play incoming 24kHz PCM audio chunks seamlessly with interruption support.
 */
export class AudioPlayer {
  /**
   * @param {object} [options]
   * @param {(volume: number) => void} [options.onVolumeChange] Output volume callback (0.0 - 1.0).
   * @param {() => void} [options.onPlaybackEnded] Callback when all scheduled audio has finished playing.
   */
  constructor({ onVolumeChange, onPlaybackEnded } = {}) {
    this.onVolumeChange = onVolumeChange;
    this.onPlaybackEnded = onPlaybackEnded;
    /** @type {AudioContext | null} */
    this.audioContext = null;
    /** @type {AnalyserNode | null} */
    this.analyserNode = null;
    /** @type {GainNode | null} */
    this.gainNode = null;
    /** @type {Set<AudioBufferSourceNode>} */
    this.activeSources = new Set();
    this.nextPlayTime = 0;
    this.sampleRate = 24000;
    this.isPlaying = false;
    this._animationFrameId = null;
    this.muted = false;
  }

  _initContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: this.sampleRate });
      this.gainNode = this.audioContext.createGain();
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 512;
      this.analyserNode.smoothingTimeConstant = 0.3;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
      this.nextPlayTime = this.audioContext.currentTime;
      this._startVolumePolling();
    }
  }

  _startVolumePolling() {
    if (!this.analyserNode || !this.onVolumeChange) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    const update = () => {
      if (this.analyserNode && this.activeSources.size > 0 && !this.muted) {
        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 120);
        this.onVolumeChange(normalized);
      } else if (this.onVolumeChange) {
        this.onVolumeChange(0);
      }

      this._animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Queues and plays base64 PCM 24kHz audio chunk.
   * @param {string} base64Pcm
   */
  async playChunk(base64Pcm) {
    this._initContext();

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const pcmBuffer = base64ToArrayBuffer(base64Pcm);
    const float32Samples = pcm16ToFloat32(pcmBuffer);

    if (float32Samples.length === 0) return;

    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32Samples.length,
      this.sampleRate
    );
    audioBuffer.getChannelData(0).set(float32Samples);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.gainNode);

    const currentTime = this.audioContext.currentTime;
    if (this.nextPlayTime < currentTime) {
      this.nextPlayTime = currentTime;
    }

    source.start(this.nextPlayTime);
    this.activeSources.add(source);
    this.isPlaying = true;

    this.nextPlayTime += audioBuffer.duration;

    source.onended = () => {
      this.activeSources.delete(source);
      if (this.activeSources.size === 0) {
        this.isPlaying = false;
        if (this.onPlaybackEnded) {
          this.onPlaybackEnded();
        }
      }
    };
  }

  /**
   * Interrupts and flushes all currently scheduled / playing audio immediately (barge-in).
   */
  interrupt() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source might have already finished
      }
    }
    this.activeSources.clear();
    this.isPlaying = false;

    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    if (this.onVolumeChange) {
      this.onVolumeChange(0);
    }
  }

  /**
   * Sets mute state for audio playback.
   * @param {boolean} isMuted
   */
  setMute(isMuted) {
    this.muted = isMuted;
    if (this.gainNode) {
      this.gainNode.gain.value = isMuted ? 0 : 1;
    }
  }

  /**
   * Closes and cleans up audio context.
   */
  close() {
    this.interrupt();

    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
