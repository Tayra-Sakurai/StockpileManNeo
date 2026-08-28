/**
 * @fileoverview The constants used in live chat.
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

export const DEFAULT_LIVE_MODEL = "models/gemini-3.1-flash-live-preview";

export const FALLBACK_LIVE_MODELS = [
  {
    name: "models/gemini-2.0-flash-exp",
    displayName: "Gemini 2.0 Flash (Experimental)",
  },
  {
    name: "models/gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
  },
  {
    name: "models/gemini-2.5-flash-live-preview",
    displayName: "Gemini 2.5 Flash Live Preview",
  },
  {
    name: "models/gemini-3.1-flash-live-preview",
    displayName: "Gemini 3.1 Flash Live Preview",
  },
];

export const AVAILABLE_VOICES = [
  { id: 'Aoede', name: 'Aoede (女性的・クリア)' },
  { id: 'Puck', name: 'Puck (男性的・軽快)' },
  { id: 'Charon', name: 'Charon (男性的・低音)' },
  { id: 'Kore', name: 'Kore (女性的・落ち着き)' },
  { id: 'Fenrir', name: 'Fenrir (男性的・力強い)' },
  { id: 'Zephyr', name: 'Zephyr (女性的・柔らか)' },
];

export const DEFAULT_VOICE = 'Aoede';

export const LIVE_WS_BASE_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';

const dateFormatter = new Intl.DateTimeFormat(
  'en-US',
  {
    dateStyle: 'full',
  }
);

export const system_instruction = `# Basic Information
It is ${dateFormatter.format(new Date())} today.

You are a smart stockpile searching and user consultant named "StockpileMan Neo Agent."

You can search the database with using the tools. You can get the category data, expiring date, stored location, description, and product name of every item.

# Terminology
You have to call these words in this instruction and the descriptions of the tools as following below:

- "The largest category": "大分類"
- "Large category": "小分類"
- "Small category": "名称"

You have to call the product name of the item "商品名".

# Language Restrtiction
You have to reply in Japanese no matter what language the user speaks.

# Contact Informations
You can tell the user about [the developer's GitHub Issues Page](https://github.com/Tayra-Sakurai/StockpileManNeo/issues) if necessary.`;

/**
 * Function declarations formatted for Gemini Live API WebSocket setup.
 */
export const liveFunctionDeclarations = [
  {
    name: 'getLargeLargeCategories',
    description: 'Retreives all the largest categories from the database.',
  },
  {
    name: 'getLargeCategories',
    description: 'Retreives all the large categories related with the given largest category.',
    parameters: {
      type: 'OBJECT',
      properties: {
        largeLargeCategoryId: {
          type: 'NUMBER',
          description: "The largest category's identity.",
        },
      },
      required: ['largeLargeCategoryId'],
    },
  },
  {
    name: 'getSmallCategories',
    description: 'Retreives all small categories related to the designated large category.',
    parameters: {
      type: 'OBJECT',
      properties: {
        largeCategoryId: {
          type: 'NUMBER',
          description: "The large category's identity.",
        },
      },
      required: ['largeCategoryId'],
    },
  },
  {
    name: 'getItems',
    description: 'Retreives all items under the identified small category given in the parameter. If no parameter is given, this returns all items in the database.',
    parameters: {
      type: 'OBJECT',
      properties: {
        smallCategoryId: {
          type: 'NUMBER',
          description: 'The identity of the small category to filter.',
        },
      },
    },
  },
  {
    name: 'getItemsWithDateRange',
    description: 'Retreives all items with the given range of timestamp values. If one timestamp is given, this returns the items whose expiring date is before the timestamp; otherwise this returns ones with the range between the two timestamps. The timestamps must be ISO encoded string.',
    parameters: {
      type: 'OBJECT',
      properties: {
        rangeStart: {
          type: 'STRING',
          description: 'The range start timestamp in ISO formatted string. If you pass only this argument, this means the range end timestamp.',
        },
        rangeEnd: {
          type: 'STRING',
          description: 'The range end timestamp in ISO specific string format. Optional',
        },
      },
      required: ['rangeStart'],
    },
  },
  {
    name: 'getPlaces',
    description: 'Retreives all places where the items are stored from the database.',
  },
];
