/**
 * @fileoverview The Gemini API caller module.
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
import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Access
 * @type {import("@google/genai").GoogleGenAI}
 */
let aimodel;

if (globalThis.__aimodel) {
    aimodel = globalThis.__aimodel;
} else {
    aimodel = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });
    globalThis.__aimodel = aimodel;
}

export default aimodel;
