/**
 * @fileoverview Backend service managing Gemini Live WebSockets, audio I/O, and tool execution.
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

import aimodel from "../../aimodules/Gemini.jsx";
import {
  getLargeLargeCategories,
  getLargeCategories,
  getSmallCategories,
  getItems,
  getItemsWithDateRange,
  getPlaces,
} from "../../aimodules/Functions/DbFunctions.js";
import {
  DEFAULT_LIVE_MODEL,
  getLiveSystemInstruction,
  liveFunctionDeclarations,
} from "./liveConstants.js";
import { AudioRecorder, AudioPlayer } from "./audioUtils.js";

/**
 * Executes database tools requested by the Gemini Live session.
 * @param {string} name Function name.
 * @param {Record<string, any>} args Function arguments.
 * @returns {Promise<any>}
 */
async function executeDbTool(name, args = {}) {
  switch (name) {
    case 'getLargeLargeCategories':
      return await getLargeLargeCategories();

    case 'getLargeCategories':
      return await getLargeCategories(args.largeLargeCategoryId);

    case 'getSmallCategories':
      return await getSmallCategories(args.largeCategoryId);

    case 'getItems':
      return await getItems(args.smallCategoryId);

    case 'getItemsWithDateRange':
      return await getItemsWithDateRange(args.rangeStart, args.rangeEnd);

    case 'getPlaces':
      return await getPlaces();

    default:
      throw new Error(`未対応の関数呼び出しです: ${name}`);
  }
}

/**
 * Service managing Gemini Live interactive talking session.
 */
export class LiveService {
  /**
   * @param {object} [callbacks]
   * @param {(status: 'idle' | 'connecting' | 'connected' | 'listening' | 'speaking' | 'executing_tool' | 'error' | 'disconnected') => void} [callbacks.onStatusChange]
   * @param {(message: { id: string, role: 'user' | 'model' | 'system' | 'tool', text?: string, toolName?: string, toolArgs?: any, toolResult?: any, timestamp: Date }) => void} [callbacks.onTranscriptUpdate]
   * @param {(micVolume: number, aiVolume: number) => void} [callbacks.onVolumeChange]
   * @param {(error: Error | string) => void} [callbacks.onError]
   */
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.session = null;
    this.audioRecorder = null;
    this.audioPlayer = null;
    this.status = 'idle';
    this.micVolume = 0;
    this.aiVolume = 0;
    this.currentModel = DEFAULT_LIVE_MODEL;
    this.currentVoice = 'Puck';
    this._isConnecting = false;
    this._accumulatedModelText = '';
  }

  _setStatus(newStatus) {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  _emitVolume() {
    if (this.callbacks.onVolumeChange) {
      this.callbacks.onVolumeChange(this.micVolume, this.aiVolume);
    }
  }

  /**
   * Starts the live talking session.
   * @param {object} [options]
   * @param {string} [options.model]
   * @param {string} [options.voice]
   */
  async start({ model = DEFAULT_LIVE_MODEL, voice = 'Puck' } = {}) {
    if (this._isConnecting || this.status === 'connected' || this.status === 'listening' || this.status === 'speaking') {
      return;
    }

    this._isConnecting = true;
    this.currentModel = model;
    this.currentVoice = voice;
    this._setStatus('connecting');

    try {
      // 1. Initialize Audio Player for Gemini Voice
      this.audioPlayer = new AudioPlayer({
        onVolumeChange: (vol) => {
          this.aiVolume = vol;
          this._emitVolume();
          if (vol > 0.05 && this.status !== 'speaking' && this.status !== 'executing_tool') {
            this._setStatus('speaking');
          }
        },
        onPlaybackEnded: () => {
          if (this.status === 'speaking') {
            this._setStatus('listening');
          }
        },
      });

      // 2. Initialize Audio Recorder for User Microphone
      this.audioRecorder = new AudioRecorder({
        onAudioData: (base64Data) => {
          if (this.session && (this.status === 'listening' || this.status === 'speaking' || this.status === 'connected')) {
            try {
              this.session.sendRealtimeInput({
                media: {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64Data,
                },
              });
            } catch (err) {
              console.warn('Realtime audio send error:', err);
            }
          }
        },
        onVolumeChange: (vol) => {
          this.micVolume = vol;
          this._emitVolume();
          if (vol > 0.1 && this.status === 'speaking') {
            // User began speaking during AI response
          }
        },
      });

      // 3. Connect to Gemini Live Multimodal API
      const liveConfig = {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: getLiveSystemInstruction(),
            },
          ],
        },
        tools: [
          {
            functionDeclarations: liveFunctionDeclarations,
          },
        ],
      };

      this.session = await aimodel.live.connect({
        model: this.currentModel,
        config: liveConfig,
        callbacks: {
          onopen: () => {
            console.info('Gemini Live WebSocket opened.');
          },
          onmessage: async (serverMessage) => {
            await this._handleServerMessage(serverMessage);
          },
          onerror: (err) => {
            console.error('Gemini Live WebSocket error:', err);
            if (this.callbacks.onError) {
              this.callbacks.onError(err?.message || 'ライブ通信エラーが発生しました。');
            }
            this._setStatus('error');
          },
          onclose: (e) => {
            console.info('Gemini Live WebSocket closed:', e);
            this._cleanup();
            this._setStatus('disconnected');
          },
        },
      });

      // 4. Start Microphone capture
      await this.audioRecorder.start();

      this._isConnecting = false;
      this._setStatus('listening');

      if (this.callbacks.onTranscriptUpdate) {
        this.callbacks.onTranscriptUpdate({
          id: `sys-${Date.now()}`,
          role: 'system',
          text: `Gemini Live に接続しました（ボイス: ${voice}）`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to start Live session:', error);
      this._isConnecting = false;
      this._cleanup();
      this._setStatus('error');
      if (this.callbacks.onError) {
        this.callbacks.onError(error?.message || 'マイクへのアクセスまたはAPI接続に失敗しました。');
      }
      throw error;
    }
  }

  /**
   * Internal message dispatcher for Gemini Live responses.
   * @param {import("@google/genai").LiveServerMessage} serverMessage
   */
  async _handleServerMessage(serverMessage) {
    if (!serverMessage) return;

    // Handle Interruption (barge-in)
    if (serverMessage.serverContent?.interrupted) {
      if (this.audioPlayer) {
        this.audioPlayer.interrupt();
      }
      this._setStatus('listening');
      return;
    }

    // Handle incoming audio & text parts from model
    if (serverMessage.serverContent?.modelTurn?.parts) {
      for (const part of serverMessage.serverContent.modelTurn.parts) {
        // Audio stream chunk
        if (part.inlineData?.data) {
          if (this.audioPlayer) {
            await this.audioPlayer.playChunk(part.inlineData.data);
          }
        }

        // Text transcript chunk
        if (part.text) {
          this._accumulatedModelText += part.text;
        }
      }
    }

    // Turn completion (commit accumulated text transcript)
    if (serverMessage.serverContent?.turnComplete) {
      if (this._accumulatedModelText.trim() && this.callbacks.onTranscriptUpdate) {
        this.callbacks.onTranscriptUpdate({
          id: `model-${Date.now()}`,
          role: 'model',
          text: this._accumulatedModelText.trim(),
          timestamp: new Date(),
        });
      }
      this._accumulatedModelText = '';
    }

    // Handle Tool Calls (Database Queries)
    if (serverMessage.toolCall?.functionCalls) {
      this._setStatus('executing_tool');
      const functionResponses = [];

      for (const call of serverMessage.toolCall.functionCalls) {
        const toolName = call.name;
        const toolArgs = call.args || {};

        if (this.callbacks.onTranscriptUpdate) {
          this.callbacks.onTranscriptUpdate({
            id: `tool-call-${call.id || Date.now()}`,
            role: 'tool',
            toolName,
            toolArgs,
            text: `データベース検索実行: ${toolName}`,
            timestamp: new Date(),
          });
        }

        try {
          const result = await executeDbTool(toolName, toolArgs);
          functionResponses.push({
            id: call.id,
            name: toolName,
            response: { output: result },
          });

          if (this.callbacks.onTranscriptUpdate) {
            this.callbacks.onTranscriptUpdate({
              id: `tool-res-${call.id || Date.now()}`,
              role: 'system',
              text: `${toolName} の検索が完了しました（${Array.isArray(result) ? `${result.length}件` : '完了'}）`,
              toolResult: result,
              timestamp: new Date(),
            });
          }
        } catch (toolError) {
          console.error(`Tool execution error for ${toolName}:`, toolError);
          functionResponses.push({
            id: call.id,
            name: toolName,
            response: { error: toolError?.message || 'Tool execution failed' },
          });
        }
      }

      // Send tool execution results back to Gemini Live
      if (this.session && functionResponses.length > 0) {
        try {
          this.session.sendToolResponse({
            functionResponses,
          });
        } catch (err) {
          console.error('Failed to send tool response:', err);
        }
      }

      this._setStatus('listening');
    }
  }

  /**
   * Sends a user text message over the active live session.
   * @param {string} text
   */
  sendTextMessage(text) {
    if (!this.session || !text.trim()) return;

    if (this.callbacks.onTranscriptUpdate) {
      this.callbacks.onTranscriptUpdate({
        id: `user-${Date.now()}`,
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      });
    }

    try {
      this.session.sendClientContent({
        turns: [
          {
            role: 'user',
            parts: [{ text: text.trim() }],
          },
        ],
        turnComplete: true,
      });
    } catch (err) {
      console.error('Failed to send client content:', err);
      if (this.callbacks.onError) {
        this.callbacks.onError('テキストの送信に失敗しました。');
      }
    }
  }

  /**
   * Toggles microphone mute.
   * @param {boolean} isMuted
   */
  setMicMute(isMuted) {
    if (this.audioRecorder) {
      this.audioRecorder.setMute(isMuted);
    }
  }

  /**
   * Toggles speaker mute.
   * @param {boolean} isMuted
   */
  setSpeakerMute(isMuted) {
    if (this.audioPlayer) {
      this.audioPlayer.setMute(isMuted);
    }
  }

  /**
   * Stops the live session and cleans up resources.
   */
  stop() {
    this._cleanup();
    this._setStatus('idle');
  }

  _cleanup() {
    if (this.audioRecorder) {
      try {
        this.audioRecorder.stop();
      } catch {
        // Ignored
      }
      this.audioRecorder = null;
    }

    if (this.audioPlayer) {
      try {
        this.audioPlayer.close();
      } catch {
        // Ignored
      }
      this.audioPlayer = null;
    }

    if (this.session) {
      try {
        this.session.close();
      } catch {
        // Ignored
      }
      this.session = null;
    }

    this.micVolume = 0;
    this.aiVolume = 0;
    this._emitVolume();
    this._accumulatedModelText = '';
    this._isConnecting = false;
  }
}
