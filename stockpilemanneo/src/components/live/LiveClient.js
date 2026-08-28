/**
 * @fileoverview Gemini Live API WebSocket Client.
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

import { DEFAULT_LIVE_MODEL, DEFAULT_VOICE, LIVE_WS_BASE_URL, liveFunctionDeclarations, system_instruction } from "./liveConstants.js";
import { process_tools } from "./LiveUtils.js";

/**
 * WebSocket client for Gemini Live API.
 */
export class LiveClient {
  /**
   * @param {object} options
   * @param {string=} options.apiKey
   * @param {string=} options.model
   * @param {string=} options.voice
   * @param {string=} options.systemInstruction
   */
  constructor({ apiKey, model = DEFAULT_LIVE_MODEL, voice = DEFAULT_VOICE, systemInstruction = system_instruction } = {}) {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    this.model = model;
    this.voice = voice;
    this.systemInstruction = systemInstruction;

    /** @type {?WebSocket} */
    this.ws = null;
    this.isSetupComplete = false;
    this.isConnected = false;

    // Callbacks
    /** @type {?() => void} */
    this.onConnected = null;
    /** @type {?(reason?: string) => void} */
    this.onDisconnected = null;
    /** @type {?(error: any) => void} */
    this.onError = null;
    /** @type {?(base64Pcm: string) => void} */
    this.onAudioData = null;
    /** @type {?() => void} */
    this.onInterrupted = null;
    /** @type {?() => void} */
    this.onTurnComplete = null;
    /** @type {?(text: string) => void} */
    this.onUserTranscript = null;
    /** @type {?(text: string, isPartial: boolean) => void} */
    this.onModelTranscript = null;
    /** @type {?(toolInfo: { calls: any[] }) => void} */
    this.onToolCallStart = null;
    /** @type {?(results: any[]) => void} */
    this.onToolCallComplete = null;
    /** @type {?(status: string) => void} */
    this.onStatusMessage = null;
  }

  /**
   * Connect to the Gemini Live WebSocket endpoint.
   * @returns {Promise<void>}
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        const error = new Error('Gemini API key is not configured.');
        if (this.onError) this.onError(error);
        return reject(error);
      }

      this.disconnect();

      const formattedModel = this.model.startsWith('models/') ? this.model : `models/${this.model}`;
      const url = `${LIVE_WS_BASE_URL}?key=${encodeURIComponent(this.apiKey)}`;

      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        if (this.onError) this.onError(err);
        return reject(err);
      }

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.onStatusMessage) this.onStatusMessage('接続しました。設定を送信中...');

        // Send Setup message
        const setupMessage = {
          setup: {
            model: formattedModel,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: this.voice,
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: this.systemInstruction }],
            },
            tools: [
              {
                functionDeclarations: liveFunctionDeclarations,
              },
            ],
          },
        };

        this.ws.send(JSON.stringify(setupMessage));
      };

      this.ws.onmessage = async (event) => {
        try {
          let data;
          if (typeof event.data === 'string') {
            data = JSON.parse(event.data);
          } else if (event.data instanceof Blob) {
            const text = await event.data.text();
            data = JSON.parse(text);
          } else {
            return;
          }

          this.handleServerMessage(data, resolve);
        } catch (err) {
          console.error('Error handling live server message:', err);
        }
      };

      this.ws.onerror = (error) => {
        console.error('Gemini Live WebSocket error:', error);
        if (this.onError) this.onError(error);
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.isSetupComplete = false;
        if (this.onDisconnected) this.onDisconnected(event.reason || '切断されました');
      };
    });
  }

  /**
   * Dispatches and processes server responses.
   * @param {object} data
   * @param {() => void} [resolveConnect]
   */
  async handleServerMessage(data, resolveConnect) {
    if (data.setupComplete) {
      this.isSetupComplete = true;
      if (this.onConnected) this.onConnected();
      if (this.onStatusMessage) this.onStatusMessage('Live対話の準備が完了しました。');
      if (resolveConnect) resolveConnect();
      return;
    }

    if (data.serverContent) {
      const { serverContent } = data;

      if (serverContent.interrupted) {
        if (this.onInterrupted) this.onInterrupted();
      }

      if (serverContent.inputTranscription?.text) {
        if (this.onUserTranscript) this.onUserTranscript(serverContent.inputTranscription.text);
      }

      if (serverContent.outputTranscription?.text) {
        if (this.onModelTranscript) this.onModelTranscript(serverContent.outputTranscription.text, true);
      }

      if (serverContent.modelTurn?.parts) {
        for (const part of serverContent.modelTurn.parts) {
          if (part.inlineData?.data) {
            if (this.onAudioData) this.onAudioData(part.inlineData.data);
          }
          if (part.text) {
            if (this.onModelTranscript) this.onModelTranscript(part.text, false);
          }
        }
      }

      if (serverContent.turnComplete) {
        if (this.onTurnComplete) this.onTurnComplete();
      }
    }

    // Handle tool calling
    if (data.toolCall) {
      if (this.onToolCallStart) {
        this.onToolCallStart({ calls: data.toolCall.functionCalls || [] });
      }
      if (this.onStatusMessage) {
        this.onStatusMessage('データベースを検索しています...');
      }

      try {
        const results = await process_tools(data);

        if (this.onToolCallComplete) {
          this.onToolCallComplete(results);
        }

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const toolResponseMessage = {
            toolResponse: {
              functionResponses: results,
            },
          };
          this.ws.send(JSON.stringify(toolResponseMessage));
          if (this.onStatusMessage) {
            this.onStatusMessage('データベースの検索結果を送信しました。');
          }
        }
      } catch (err) {
        console.error('Failed to process tool calls:', err);
      }
    }
  }

  /**
   * Streams a microphone audio PCM-16 chunk (16kHz mono) to the Live session.
   * @param {string} base64Chunk
   */
  sendAudioChunk(base64Chunk) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetupComplete) {
      return;
    }

    const audioMessage = {
      realtimeInput: {
        audio: {
          mimeType: 'audio/pcm;rate=16000',
          data: base64Chunk,
        },
      },
    };

    this.ws.send(JSON.stringify(audioMessage));
  }

  /**
   * Sends a user text prompt into the Live session.
   * @param {string} text
   */
  sendTextMessage(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetupComplete) {
      return;
    }

    const clientContentMessage = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(clientContentMessage));
  }

  /**
   * Closes the active WebSocket connection.
   */
  disconnect() {
    this.isSetupComplete = false;
    this.isConnected = false;
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch {
        // Ignore closing errors
      }
      this.ws = null;
    }
  }
}
