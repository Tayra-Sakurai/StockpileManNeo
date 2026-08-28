/**
 * @fileoverview Audio recording and playback service for Gemini Live API.
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

import { base64ToPcm16, calculateAudioLevel, downsampleBuffer, float32ToPcm16, pcm16ToBase64, pcm16ToFloat32 } from "./LiveUtils.js";

/**
 * Service to manage microphone input recording and model audio playback for Live API.
 */
export class LiveAudioService {
  constructor() {
    /** @type {?AudioContext} */
    this.inputAudioContext = null;
    /** @type {?AudioContext} */
    this.outputAudioContext = null;
    /** @type {?MediaStream} */
    this.mediaStream = null;
    /** @type {?ScriptProcessorNode} */
    this.scriptProcessor = null;
    /** @type {?MediaStreamAudioSourceNode} */
    this.mediaSource = null;

    /** @type {boolean} */
    this.isMuted = false;
    /** @type {boolean} */
    this.isRecording = false;

    /** @type {number} */
    this.nextPlayTime = 0;
    /** @type {Set<AudioBufferSourceNode>} */
    this.activeSources = new Set();

    /** @type {?GainNode} */
    this.outputGainNode = null;

    // Event callbacks
    /** @type {?(base64Chunk: string) => void} */
    this.onAudioChunk = null;
    /** @type {?(level: number) => void} */
    this.onInputLevel = null;
    /** @type {?(level: number) => void} */
    this.onOutputLevel = null;
  }

  /**
   * Initializes audio contexts and requests microphone access.
   * @returns {Promise<void>}
   */
  async startRecording() {
    if (this.isRecording) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.inputAudioContext = new AudioContextClass();
    this.outputAudioContext = new AudioContextClass({ sampleRate: 24000 });

    if (this.outputAudioContext.state === 'suspended') {
      await this.outputAudioContext.resume();
    }
    if (this.inputAudioContext.state === 'suspended') {
      await this.inputAudioContext.resume();
    }

    this.outputGainNode = this.outputAudioContext.createGain();
    this.outputGainNode.connect(this.outputAudioContext.destination);

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.mediaSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
    const bufferSize = 4096;
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isRecording || this.isMuted) {
        if (this.onInputLevel) this.onInputLevel(0);
        return;
      }

      const inputBuffer = event.inputBuffer.getChannelData(0);
      const level = calculateAudioLevel(inputBuffer);
      if (this.onInputLevel) {
        this.onInputLevel(level);
      }

      // Downsample input audio to 16000Hz if needed
      const targetSampleRate = 16000;
      const downsampled = downsampleBuffer(inputBuffer, this.inputAudioContext.sampleRate, targetSampleRate);
      const pcm16 = float32ToPcm16(downsampled);
      const base64Chunk = pcm16ToBase64(pcm16);

      if (this.onAudioChunk) {
        this.onAudioChunk(base64Chunk);
      }
    };

    this.mediaSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
    this.isRecording = true;
  }

  /**
   * Sets microphone mute state.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
  }

  /**
   * Plays incoming 24kHz PCM 16-bit base64 audio chunk seamlessly.
   * @param {string} base64Pcm24k
   */
  playAudioChunk(base64Pcm24k) {
    if (!this.outputAudioContext || !this.outputGainNode) return;

    if (this.outputAudioContext.state === 'suspended') {
      this.outputAudioContext.resume().catch(() => {});
    }

    try {
      const pcm16 = base64ToPcm16(base64Pcm24k);
      const float32 = pcm16ToFloat32(pcm16);

      if (float32.length === 0) return;

      const level = calculateAudioLevel(float32);
      if (this.onOutputLevel) {
        this.onOutputLevel(level);
      }

      const audioBuffer = this.outputAudioContext.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputGainNode);

      const currentTime = this.outputAudioContext.currentTime;
      const startTime = Math.max(currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;

      this.activeSources.add(source);
      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0 && this.onOutputLevel) {
          this.onOutputLevel(0);
        }
      };
    } catch (e) {
      console.error('Failed to play audio chunk:', e);
    }
  }

  /**
   * Stops all active audio playback immediately when interrupted.
   */
  interrupt() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Source may have already stopped
      }
    }
    this.activeSources.clear();
    if (this.outputAudioContext) {
      this.nextPlayTime = this.outputAudioContext.currentTime;
    }
    if (this.onOutputLevel) {
      this.onOutputLevel(0);
    }
  }

  /**
   * Stops recording and releases all audio contexts and media streams.
   */
  stop() {
    this.isRecording = false;
    this.interrupt();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaSource) {
      this.mediaSource.disconnect();
      this.mediaSource = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close().catch(() => {});
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close().catch(() => {});
      this.outputAudioContext = null;
    }
    if (this.onInputLevel) this.onInputLevel(0);
    if (this.onOutputLevel) this.onOutputLevel(0);
  }
}
