---
layout: doc
title: API Reference
---

# API Reference

This document provides a comprehensive API reference for **StockpileMan Neo**, covering database functions, AI agent tool interfaces, vector embedding utilities, barcode detection, helper modules, and the database schema.

---

## Table of Contents

- [Database Functions & AI Tools](#database-functions-ai-tools)
  - [getLargeLargeCategories](#getlargelargecategories)
  - [getLargeCategories](#getlargecategories)
  - [getSmallCategories](#getsmallcategories)
  - [getItems](#getitems)
  - [getItemsWithDateRange](#getitemswithdaterange)
  - [getPlaces](#getplaces)
  - [execFuncCall](#execfunccall)
  - [tools](#tools)
- [Vector & Embedding Utilities](#vector-embedding-utilities)
  - [createEmbeddingVector](#createembeddingvector)
  - [createSearchVector](#createsearchvector)
  - [toScalarVector](#toscalarvector)
  - [calcNorm](#calcnorm)
  - [calcInnerProduct](#calcinnerproduct)
- [Barcode Detection](#barcode-detection)
  - [getBarcode](#getbarcode)
- [Item Sorting](#item-sorting)
  - [itemCompare](#itemcompare)
- [Timer Utilities](#timer-utilities)
  - [asynchronousTimer](#asynchronoustimer)
- [Gemini AI Configuration & Client](#gemini-ai-configuration-client)
  - [aimodel](#aimodel)
  - [GEMINI_MODEL](#gemini_model)
  - [generation_config](#generation_config)
  - [system_instruction](#system_instruction)
- [Supabase Client & Database Schema](#supabase-client-database-schema)
  - [supabase](#supabase)
  - [Database Tables Schema](#database-tables-schema)

---

## Database Functions & AI Tools

Module: `src/aimodules/Functions/DbFunctions.js`

These functions query Supabase tables and serve as the tool functions callable by the Gemini AI agent.

### `getLargeLargeCategories`

Retrieves all largest (top-level) categories available from the database.

```javascript
export async function getLargeLargeCategories(): Promise<Array<{ id: number, name: string }>>
```

- **Parameters**: None.
- **Returns**: `Promise<Array<{ id: number, name: string }>>` — Array of top-level category records.
- **Throws**: `PostgrestError` if the database query fails.

```javascript
import { getLargeLargeCategories } from '@/aimodules/Functions/DbFunctions';

const categories = await getLargeLargeCategories();
console.log(categories); // [{ id: 1, name: 'Food' }, { id: 2, name: 'Daily Necessities' }]
```

---

### `getLargeCategories`

Retrieves all large categories associated with the given largest category ID.

```javascript
export async function getLargeCategories(
  largeLargeCategoryId: number
): Promise<Array<{ id: number, name: string }>>
```

- **Parameters**:
  - `largeLargeCategoryId` (`number`): The identifier of the parent largest category.
- **Returns**: `Promise<Array<{ id: number, name: string }>>` — Array of large category objects.
- **Throws**: `PostgrestError` if the database query fails.

```javascript
const largeCategories = await getLargeCategories(1);
```

---

### `getSmallCategories`

Retrieves all small categories associated with the designated large category ID.

```javascript
export async function getSmallCategories(
  largeCategoryId: number
): Promise<Array<{ id: number, name: string }>>
```

- **Parameters**:
  - `largeCategoryId` (`number`): The identifier of the parent large category.
- **Returns**: `Promise<Array<{ id: number, name: string }>>` — Array of small category objects.
- **Throws**: `PostgrestError` if the database query fails.

```javascript
const smallCategories = await getSmallCategories(3);
```

---

### `getItems`

Retrieves items from the database. If `smallCategoryId` is specified, filters by that category; otherwise, returns all items.

```javascript
export async function getItems(
  smallCategoryId?: number
): Promise<Array<{
  id: number,
  productName: string,
  expireDate: string | null,
  description: string | null,
  smallCategoryId: number,
  placeId: number
}>>
```

- **Parameters**:
  - `smallCategoryId` (`number`, optional): The identity of the small category to filter by.
- **Returns**: `Promise<Array<Item>>` — Array of items mapped with normalized property names (`productName`, `expireDate`, `placeId`, etc.).
- **Throws**: `PostgrestError` if the database query fails.

```javascript
// Get items under small category #5
const items = await getItems(5);

// Get all items
const allItems = await getItems();
```

---

### `getItemsWithDateRange`

Retrieves items whose expiration date (`life`) falls within the specified date range.

```javascript
export async function getItemsWithDateRange(
  rangeStart: string,
  rangeEnd?: string
): Promise<Array<{
  id: number,
  productName: string,
  expireDate: string | null,
  description: string | null,
  smallCategoryId: number,
  placeId: number
}>>
```

- **Parameters**:
  - `rangeStart` (`string`): ISO-formatted date string. If `rangeEnd` is omitted, this acts as the upper bound (`life <= rangeStart`).
  - `rangeEnd` (`string`, optional): ISO-formatted date string representing the upper bound (`rangeStart <= life <= rangeEnd`).
- **Returns**: `Promise<Array<Item>>` — Array of matching item objects.
- **Throws**: `PostgrestError` if the database query fails.

```javascript
// Items expiring on or before 2026-12-31
const expiringSoon = await getItemsWithDateRange('2026-12-31');

// Items expiring between 2026-06-01 and 2026-08-31
const summerItems = await getItemsWithDateRange('2026-06-01', '2026-08-31');
```

---

### `getPlaces`

Retrieves all storage locations registered in the database.

```javascript
export async function getPlaces(): Promise<Array<{ id: number, name: string }>>
```

- **Parameters**: None.
- **Returns**: `Promise<Array<{ id: number, name: string }>>` — Array of location records.
- **Throws**: `PostgrestError` if the database query fails.

```javascript
const places = await getPlaces();
console.log(places); // [{ id: 1, name: 'Kitchen Pantry' }, { id: 2, name: 'Living Room Closet' }]
```

---

### `execFuncCall`

Asynchronous generator that parses Gemini API function call steps from an interaction response, invokes the matching database function, and yields tool result objects formatted for the Gemini API.

```javascript
export async function* execFuncCall(
  response: import("@google/genai").Interactions.Interaction
): AsyncGenerator<import("@google/genai").Interactions.FunctionResultStep | undefined>
```

- **Parameters**:
  - `response`: The Gemini interaction response containing `steps` with `type: 'function_call'`.
- **Yields**: Function execution result steps formatted as `{ type: 'function_result', call_id, name, result: [{ type: 'text', text }] }`.
- **Throws**: `Error` if the interaction contains an undefined call type.

```javascript
for await (const resultStep of execFuncCall(interactionResponse)) {
  console.log('Yielded result for tool:', resultStep);
}
```

---

### `tools`

Array of Gemini Function Declarations for tool calling.

```javascript
export const tools: import("@google/genai").Interactions.Tool[]
```

Contains definitions for:
- `getLargeLargeCategories`
- `getLargeCategories`
- `getSmallCategories`
- `getItems`
- `getItemsWithDateRange`
- `getPlaces`

---

## Vector & Embedding Utilities

Module: `src/components/stockpile/stockpileVectors.js`

Provides vector generation using the Gemini Embedding API (`gemini-embedding-2`) and vector math utilities (norm, inner product) for semantic stockpile search.

### `createEmbeddingVector`

Creates a 768-dimensional normalized embedding vector for item and category indexing.

```javascript
export async function createEmbeddingVector(
  text: string,
  title?: string
): Promise<Array<number>>
```

- **Parameters**:
  - `text` (`string`): The text content to embed.
  - `title` (`string`, optional): A title prefix. Defaults to `'none'`.
- **Returns**: `Promise<Array<number>>` — A 768-dimensional normalized float array. If `VITE_GEMINI_API_KEY` is not set, `text` is empty, or the API call fails, returns a zero vector (768 zeros).

```javascript
const vector = await createEmbeddingVector('Organic Green Tea', 'Beverages');
```

---

### `createSearchVector`

Generates an embedding vector optimized for search queries with the task prefix `task: search result | query: ${text}`.

```javascript
export async function createSearchVector(
  text: string
): Promise<Array<number>>
```

- **Parameters**:
  - `text` (`string`): The search query text.
- **Returns**: `Promise<Array<number>>` — A 768-dimensional normalized float array or zero vector.

```javascript
const queryVector = await createSearchVector('emergency water supplies');
```

---

### `toScalarVector`

Converts a vector array to its first scalar element.

```javascript
export function toScalarVector(vector: any): number
```

- **Parameters**: `vector` (`any`): Array or vector-like object.
- **Returns**: `number` — First number or `0`.

---

### `calcNorm`

Calculates the Euclidean norm ($L_2$ norm) of a vector.

$$\|\mathbf{v}\| = \sqrt{\sum_{i=1}^n v_i^2}$$

```javascript
export function calcNorm(vector: Array<number>): number
```

- **Parameters**:
  - `vector` (`Array<number>`): The vector array.
- **Returns**: `number` — The computed vector norm.
- **Throws**: `TypeError` if input is not an array or contains non-numeric values.

---

### `calcInnerProduct`

Calculates the inner (dot) product of two vectors of the same dimension.

$$\mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^n u_i v_i$$

```javascript
export function calcInnerProduct(
  vector1: Array<number>,
  vector2: Array<number>
): number
```

- **Parameters**:
  - `vector1` (`Array<number>`): First vector.
  - `vector2` (`Array<number>`): Second vector.
- **Returns**: `number` — Dot product value.
- **Throws**: `TypeError` if arguments are not arrays or have mismatched lengths.

---

## Barcode Detection

Module: `src/detectors/getBarcode.js`

Uses the web standard `BarcodeDetector` API to scan and decode barcodes from image files.

### `getBarcode`

```javascript
export default async function getBarcode(file: File): Promise<string>
```

- **Parameters**:
  - `file` (`File`): An image file selected by the user.
- **Supported Formats**: `ean_13`, `ean_8`, `upc_a`, `upc_e`.
- **Returns**: `Promise<string>` — The raw barcode string (e.g. JAN/EAN code), or an error / fallback message when detection is not supported or fails.

```javascript
import getBarcode from '@/detectors/getBarcode';

const fileInput = document.querySelector('input[type="file"]');
const rawBarcode = await getBarcode(fileInput.files[0]);
console.log('Detected barcode:', rawBarcode);
```

---

## Item Sorting

Module: `src/sortmodules/ItemSorter.js`

Sorting comparator for inventory lists.

### `itemCompare`

```javascript
export default function itemCompare<T extends { life: string | null, name: string, id: number }>(
  itemA: T,
  itemB: T
): number
```

- **Parameters**:
  - `itemA` (`T`): First item.
  - `itemB` (`T`): Second item.
- **Returns**: `number` (`-1`, `0`, `1`):
  1. Items with expiration dates (`life`) appear before items without (`null`/undefined).
  2. Items with earlier expiration dates appear first.
  3. Tie-breaking falls back to alphabetical order by `name`, then numerical order by `id`.

```javascript
import itemCompare from '@/sortmodules/ItemSorter';

const sortedItems = [...items].sort(itemCompare);
```

---

## Timer Utilities

Module: `src/timers/AsynchronousTimer.js`

Promisified asynchronous delay helper.

### `asynchronousTimer`

```javascript
export default function asynchronousTimer(duration: number): Promise<number>
```

- **Parameters**:
  - `duration` (`number`): Milliseconds to wait.
- **Returns**: `Promise<number>` — Resolves with `duration` when elapsed.

```javascript
import asynchronousTimer from '@/timers/AsynchronousTimer';

await asynchronousTimer(1500); // Waits 1.5 seconds
```

---

## Gemini AI Configuration & Client

Modules: `src/aimodules/Gemini.jsx`, `src/components/chat/constants.js`

### `aimodel`

Singleton instance of `GoogleGenAI` initialized with `import.meta.env.VITE_GEMINI_API_KEY`.

```javascript
import aimodel from '@/aimodules/Gemini.jsx';
// Instance of GoogleGenAI
```

### `GEMINI_MODEL`

Default model identifier for AI chat agent interactions:

```javascript
export const GEMINI_MODEL = 'models/gemini-3.5-flash-lite';
```

### `generation_config`

Generation settings for Gemini model interactions:

```javascript
export const generation_config = {
  thinking_level: 'high'
};
```

### `system_instruction`

The system prompt defining the AI agent persona ("StockpileMan Neo Agent"), current date context, database terminology mappings (大分類, 小分類, 名称, 保管場所), and developer support links.

---

## Supabase Client & Database Schema

Modules: `src/client.js`, `src/types/supabase.ts`

### `supabase`

Singleton Supabase client configured with `VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

```javascript
import supabase from '@/client.js';
```

### Database Tables Schema

| Table Name | Description | Key Columns |
|---|---|---|
| `large_large_categories` | Top-level category (大分類) | `id` (PK), `name`, `vector`, `user_id`, `created_at` |
| `large_categories` | Mid-level category (小分類階層) | `id` (PK), `name`, `large_large_category_id` (FK), `vector`, `user_id`, `created_at` |
| `small_categories` | Detailed category / Name level (名称階層) | `id` (PK), `name`, `large_category_id` (FK), `vector`, `user_id`, `created_at` |
| `locations` | Storage location (保管場所) | `id` (PK), `name`, `vector`, `user_id`, `created_at` |
| `items` | Stockpile inventory item (品目) | `id` (PK), `name`, `life` (expire date), `purchase_timestamp`, `description`, `small_category_id` (FK), `location_id` (FK), `barcode_id` (FK), `vector`, `user_id`, `created_at` |
| `barcode_data` | Barcode cache & mappings (バーコード) | `id` (PK), `jan_code`, `name`, `small_category_id` (FK), `user_id`, `created_at` |
