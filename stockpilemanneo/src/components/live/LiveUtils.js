/**
 * @fileoverview The Live utilities.
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

import { getItems, getItemsWithDateRange, getLargeCategories, getLargeLargeCategories, getPlaces, getSmallCategories } from "../../aimodules/Functions/DbFunctions.js";

/**
 * Process the tool calling message and returns the result.
 * @param {object} message The server message containing toolCall.
 * @returns {Promise<Array.<{id: string, name: string, response: object}>>}
 * @throws {TypeError} The type of response is not a function calling request.
 */
export async function process_tools(message) {
  /**
   * The result array.
   * @type {Array.<{id: string, name: string, response: object}>}
   */
  const results = [];

  if (!message.toolCall?.functionCalls)
    throw new TypeError('The type of response is not function calling format.');

  for (const call of message.toolCall.functionCalls) {
    try {
      if (call.name === 'getLargeLargeCategories') {
        const result = await getLargeLargeCategories();
        results.push({
          id: call.id,
          name: call.name,
          response: {
            result,
          },
        });
      } else if (call.name === 'getLargeCategories') {
        const { args } = call;
        const result = await getLargeCategories(args.largeLargeCategoryId);
        results.push({
          id: call.id,
          name: call.name,
          response: {
            result,
          },
        });
      } else if (call.name === 'getSmallCategories') {
        const { id, name, args } = call;
        const result = await getSmallCategories(args.largeCategoryId);
        results.push({
          id,
          name,
          response: { result },
        });
      } else if (call.name === 'getItems') {
        const { id, name, args } = call;
        const result = await getItems(args?.smallCategoryId);
        results.push({
          id,
          name,
          response: { result },
        });
      } else if (call.name === 'getItemsWithDateRange') {
        const { id, name, args } = call;
        const result = await getItemsWithDateRange(args.rangeStart, args.rangeEnd);
        results.push({
          id,
          name,
          response: { result },
        });
      } else if (call.name === 'getPlaces') {
        const { id, name } = call;
        const result = await getPlaces();
        results.push({
          id,
          name,
          response: { result },
        });
      } else {
        const { id, name } = call;
        results.push({
          id,
          name,
          response: {
            error: `Tool ${name} is not implemented.`,
          },
        });
      }
    } catch (err) {
      const { id, name } = call;
      results.push({
        id,
        name,
        response: {
          error: String(err?.message ?? err),
        },
      });
    }
  }

  return results;
}

/**
 * Converts Float32Array audio samples (-1.0 to 1.0) into 16-bit linear PCM Int16Array.
 * @param {Float32Array} float32Array
 * @returns {Int16Array}
 */
export function float32ToPcm16(float32Array) {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm16;
}

/**
 * Converts 16-bit linear PCM Int16Array into Float32Array (-1.0 to 1.0).
 * @param {Int16Array} int16Array
 * @returns {Float32Array}
 */
export function pcm16ToFloat32(int16Array) {
  const float32 = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32[i] = int16Array[i] / 32768.0;
  }
  return float32;
}

/**
 * Converts Int16Array PCM buffer to a base64 encoded string.
 * @param {Int16Array} pcm16
 * @returns {string}
 */
export function pcm16ToBase64(pcm16) {
  const bytes = new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Decodes base64 encoded PCM 16-bit data into Int16Array.
 * @param {string} base64
 * @returns {Int16Array}
 */
export function base64ToPcm16(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
}

/**
 * Downsamples audio from inputSampleRate to outputSampleRate (e.g. from 48000Hz to 16000Hz).
 * @param {Float32Array} buffer
 * @param {number} inputSampleRate
 * @param {number} outputSampleRate
 * @returns {Float32Array}
 */
export function downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }
  if (inputSampleRate < outputSampleRate) {
    return buffer;
  }
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
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
 * Computes RMS audio volume level (normalized between 0 and 100).
 * @param {Float32Array} samples
 * @returns {number}
 */
export function calculateAudioLevel(samples) {
  if (!samples || samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return Math.min(100, Math.round(rms * 150));
}