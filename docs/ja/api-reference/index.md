---
layout: doc
title: APIリファレンス
---

# APIリファレンス

このドキュメントでは、**StockpileMan Neo** で使用されているデータベース関数、AIエージェントのツールインターフェース、ベクトル埋め込みユーティリティ、バーコード検出、各種ヘルパーモジュール、およびデータベーススキーマに関する包括的なAPIリファレンスを提供します。

---

## 目次

- [データベース関数 & AIツール](#データベース関数--aiツール)
  - [getLargeLargeCategories](#getlargelargecategories)
  - [getLargeCategories](#getlargecategories)
  - [getSmallCategories](#getsmallcategories)
  - [getItems](#getitems)
  - [getItemsWithDateRange](#getitemswithdaterange)
  - [getPlaces](#getplaces)
  - [execFuncCall](#execfunccall)
  - [tools](#tools)
- [ベクトル & 埋め込みユーティリティ](#ベクトル--埋め込みユーティリティ)
  - [createEmbeddingVector](#createembeddingvector)
  - [createSearchVector](#createsearchvector)
  - [toScalarVector](#toscalarvector)
  - [calcNorm](#calcnorm)
  - [calcInnerProduct](#calcinnerproduct)
- [バーコード検出](#バーコード検出)
  - [getBarcode](#getbarcode)
- [品目ソートモジュール](#品目ソートモジュール)
  - [itemCompare](#itemcompare)
- [タイマーユーティリティ](#タイマーユーティリティ)
  - [asynchronousTimer](#asynchronoustimer)
- [Gemini AI 設定 & クライアント](#gemini-ai-設定--クライアント)
  - [aimodel](#aimodel)
  - [GEMINI_MODEL](#gemini_model)
  - [generation_config](#generation_config)
  - [system_instruction](#system_instruction)
- [Supabase クライアント & データベーススキーマ](#supabase-クライアント--データベーススキーマ)
  - [supabase](#supabase)
  - [データベーステーブルスキーマ](#データベーステーブルスキーマ)

---

## データベース関数 & AIツール

モジュールパス: `src/aimodules/Functions/DbFunctions.js`

Supabaseデータベースと連携し、Gemini AIエージェントのFunction Callingツールとしても利用される関数群です。

### `getLargeLargeCategories`

データベースからすべての大分類（最上位カテゴリ）を取得します。

```javascript
export async function getLargeLargeCategories(): Promise<Array<{ id: number, name: string }>>
```

- **パラメータ**: なし
- **戻り値**: `Promise<Array<{ id: number, name: string }>>` — 大分類のレコード配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
import { getLargeLargeCategories } from '@/aimodules/Functions/DbFunctions';

const categories = await getLargeLargeCategories();
console.log(categories); // [{ id: 1, name: '食品' }, { id: 2, name: '日用品' }]
```

---

### `getLargeCategories`

指定された大分類IDに属するすべての中分類（小分類階層）を取得します。

```javascript
export async function getLargeCategories(
  largeLargeCategoryId: number
): Promise<Array<{ id: number, name: string }>>
```

- **パラメータ**:
  - `largeLargeCategoryId` (`number`): 親となる大分類のID
- **戻り値**: `Promise<Array<{ id: number, name: string }>>` — 中分類オブジェクトの配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
const largeCategories = await getLargeCategories(1);
```

---

### `getSmallCategories`

指定された中分類IDに属するすべての小分類（名称階層）を取得します。

```javascript
export async function getSmallCategories(
  largeCategoryId: number
): Promise<Array<{ id: number, name: string }>>
```

- **パラメータ**:
  - `largeCategoryId` (`number`): 親となる中分類のID
- **戻り値**: `Promise<Array<{ id: number, name: string }>>` — 小分類オブジェクトの配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
const smallCategories = await getSmallCategories(3);
```

---

### `getItems`

データベースから品目一覧を取得します。`smallCategoryId` が指定された場合は該当カテゴリでフィルタリングし、指定されない場合は全品目を返します。

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

- **パラメータ**:
  - `smallCategoryId` (`number`, 任意): フィルタ対象の小分類ID
- **戻り値**: `Promise<Array<Item>>` — 整形されたプロパティ名（`productName`, `expireDate`, `placeId` 等）を持つ品目オブジェクトの配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
// 小分類ID: 5 に属する品目を取得
const items = await getItems(5);

// すべての品目を取得
const allItems = await getItems();
```

---

### `getItemsWithDateRange`

賞味期限・消費期限（`life`）が指定範囲内にある品目を取得します。

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

- **パラメータ**:
  - `rangeStart` (`string`): ISO形式の日付文字列。`rangeEnd` が省略された場合は上限日として機能します（`life <= rangeStart`）。
  - `rangeEnd` (`string`, 任意): ISO形式の日付文字列（`rangeStart <= life <= rangeEnd`）。
- **戻り値**: `Promise<Array<Item>>` — 条件に一致する品目オブジェクトの配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
// 2026年12月31日以前に期限が切れる品目
const expiringSoon = await getItemsWithDateRange('2026-12-31');

// 2026年6月1日から2026年8月31日までの品目
const summerItems = await getItemsWithDateRange('2026-06-01', '2026-08-31');
```

---

### `getPlaces`

データベースに登録されているすべての保管場所を取得します。

```javascript
export async function getPlaces(): Promise<Array<{ id: number, name: string }>>
```

- **パラメータ**: なし
- **戻り値**: `Promise<Array<{ id: number, name: string }>>` — 保管場所レコードの配列
- **例外**: クエリ失敗時に `PostgrestError` をスロー

```javascript
const places = await getPlaces();
console.log(places); // [{ id: 1, name: 'パントリー' }, { id: 2, name: 'リビング棚' }]
```

---

### `execFuncCall`

Gemini API の対話レスポンスに含まれる関数呼び出し（`function_call`）ステップを順次実行し、Gemini API 用のツール実行結果を生成する非同期ジェネレータです。

```javascript
export async function* execFuncCall(
  response: import("@google/genai").Interactions.Interaction
): AsyncGenerator<import("@google/genai").Interactions.FunctionResultStep | undefined>
```

- **パラメータ**:
  - `response`: `type: 'function_call'` ステップを含む Gemini のインタラクションオブジェクト
- **Yield**: `{ type: 'function_result', call_id, name, result: [{ type: 'text', text }] }` 形式の関数実行結果ステップ
- **例外**: 未定義の呼び出しタイプが渡された場合に `Error` をスロー

```javascript
for await (const resultStep of execFuncCall(interactionResponse)) {
  console.log('ツール実行結果:', resultStep);
}
```

---

### `tools`

Gemini Function Calling 用のツール定義スキーマ配列です。

```javascript
export const tools: import("@google/genai").Interactions.Tool[]
```

以下の関数定義を含みます:
- `getLargeLargeCategories`
- `getLargeCategories`
- `getSmallCategories`
- `getItems`
- `getItemsWithDateRange`
- `getPlaces`

---

## ベクトル & 埋め込みユーティリティ

モジュールパス: `src/components/stockpile/stockpileVectors.js`

Gemini Embedding API（`gemini-embedding-2`）を用いた埋め込みベクトル生成および、自然言語による備蓄品セマンティック検索のためのベクトル計算関数を提供します。

### `createEmbeddingVector`

品目やカテゴリのインデックス用に 768 次元の正規化された埋め込みベクトルを生成します。

```javascript
export async function createEmbeddingVector(
  text: string,
  title?: string
): Promise<Array<number>>
```

- **パラメータ**:
  - `text` (`string`): 埋め込む対象のテキスト
  - `title` (`string`, 任意): タイトル（省略時は `'none'`）
- **戻り値**: `Promise<Array<number>>` — 768 次元の正規化浮動小数点数配列。APIキー未設定、空文字、またはエラー時はゼロベクトル（0が768個）を返します。

```javascript
const vector = await createEmbeddingVector('有機緑茶 500ml', '飲料');
```

---

### `createSearchVector`

`task: search result | query: ${text}` 形式のプレフィックスを付与し、検索クエリ用に最適化された 768 次元ベクトルを生成します。

```javascript
export async function createSearchVector(
  text: string
): Promise<Array<number>>
```

- **パラメータ**:
  - `text` (`string`): 検索クエリ文字列
- **戻り値**: `Promise<Array<number>>` — 768 次元の正規化ベクトルまたはゼロベクトル

```javascript
const queryVector = await createSearchVector('非常用の保存水');
```

---

### `toScalarVector`

ベクトル配列から最初のスカラー値を取り出します。

```javascript
export function toScalarVector(vector: any): number
```

- **パラメータ**: `vector` (`any`): ベクトル配列
- **戻り値**: `number` — 最初の要素数値または `0`

---

### `calcNorm`

ベクトルのユークリッドノルム（$L_2$ ノルム）を計算します。

$$\|\mathbf{v}\| = \sqrt{\sum_{i=1}^n v_i^2}$$

```javascript
export function calcNorm(vector: Array<number>): number
```

- **パラメータ**:
  - `vector` (`Array<number>`): ベクトル配列
- **戻り値**: `number` — ノルム計算結果
- **例外**: 引数が配列でない場合、または数値以外の要素が含まれる場合に `TypeError` をスロー

---

### `calcInnerProduct`

同じ次元を持つ2つのベクトルの内積（ドット積）を計算します。

$$\mathbf{u} \cdot \mathbf{v} = \sum_{i=1}^n u_i v_i$$

```javascript
export function calcInnerProduct(
  vector1: Array<number>,
  vector2: Array<number>
): number
```

- **パラメータ**:
  - `vector1` (`Array<number>`): 1つ目のベクトル
  - `vector2` (`Array<number>`): 2つ目のベクトル
- **戻り値**: `number` — 内積の値
- **例外**: 配列でない場合、または次元数（要素数）が一致しない場合に `TypeError` をスロー

---

## バーコード検出

モジュールパス: `src/detectors/getBarcode.js`

ブラウザ標準の `BarcodeDetector` API を利用して、画像ファイルからバーコードを読み取ります。

### `getBarcode`

```javascript
export default async function getBarcode(file: File): Promise<string>
```

- **パラメータ**:
  - `file` (`File`): 読み取り対象の画像ファイル（カメラ入力等）
- **対応フォーマット**: `ean_13`, `ean_8`, `upc_a`, `upc_e`
- **戻り値**: `Promise<string>` — 検出されたバーコードの文字列値（JANコード等）。非対応端末や検出失敗時はメッセージ文字列を返します。

```javascript
import getBarcode from '@/detectors/getBarcode';

const fileInput = document.querySelector('input[type="file"]');
const janCode = await getBarcode(fileInput.files[0]);
console.log('読み取り結果:', janCode);
```

---

## 品目ソートモジュール

モジュールパス: `src/sortmodules/ItemSorter.js`

備蓄品一覧を表示する際の比較関数を提供します。

### `itemCompare`

```javascript
export default function itemCompare<T extends { life: string | null, name: string, id: number }>(
  itemA: T,
  itemB: T
): number
```

- **パラメータ**:
  - `itemA` (`T`): 比較対象の品目A
  - `itemB` (`T`): 比較対象の品目B
- **戻り値**: `number` (`-1`, `0`, `1`):
  1. 賞味期限・消費期限（`life`）が設定されている品目を優先（未設定は後方に配置）。
  2. 期限が近い順（昇順）に並べ替え。
  3. 期限が同じ場合は品目名（`name`）の辞書順、ID順で比較。

```javascript
import itemCompare from '@/sortmodules/ItemSorter';

const sortedItems = [...items].sort(itemCompare);
```

---

## タイマーユーティリティ

モジュールパス: `src/timers/AsynchronousTimer.js`

`await` で待機可能なタイマー関数です。

### `asynchronousTimer`

```javascript
export default function asynchronousTimer(duration: number): Promise<number>
```

- **パラメータ**:
  - `duration` (`number`): 待機時間（ミリ秒）
- **戻り値**: `Promise<number>` — 指定時間が経過した後に `duration` を解決する Promise

```javascript
import asynchronousTimer from '@/timers/AsynchronousTimer';

await asynchronousTimer(1000); // 1秒間待機
```

---

## Gemini AI 設定 & クライアント

モジュールパス: `src/aimodules/Gemini.jsx`, `src/components/chat/constants.js`

### `aimodel`

環境変数 `import.meta.env.VITE_GEMINI_API_KEY` を用いて初期化された `GoogleGenAI` のシングルトンインスタンスです。

```javascript
import aimodel from '@/aimodules/Gemini.jsx';
```

### `GEMINI_MODEL`

AIチャットエージェントのデフォルトモデル識別子です:

```javascript
export const GEMINI_MODEL = 'models/gemini-3.5-flash-lite';
```

### `generation_config`

Gemini モデルとの対話生成設定です:

```javascript
export const generation_config = {
  thinking_level: 'high'
};
```

### `system_instruction`

AIエージェントのペルソナ（StockpileMan Neo Agent）、現在日時の動的コンテキスト、データベース用語の呼び分け定義（大分類、小分類、名称、保管場所）、および開発者への問い合わせ案内ルールを定めたシステムインストラクションです。

---

## Supabase クライアント & データベーススキーマ

モジュールパス: `src/client.js`, `src/types/supabase.ts`

### `supabase`

`VITE_PUBLIC_SUPABASE_URL` および `VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY` で初期化された Supabase クライアントのシングルトンインスタンスです。

```javascript
import supabase from '@/client.js';
```

### データベーステーブルスキーマ

| テーブル名 | 説明 | 主要カラム |
|---|---|---|
| `large_large_categories` | 最上位カテゴリ（大分類） | `id` (PK), `name`, `vector`, `user_id`, `created_at` |
| `large_categories` | 中位カテゴリ（小分類階層） | `id` (PK), `name`, `large_large_category_id` (FK), `vector`, `user_id`, `created_at` |
| `small_categories` | 詳細カテゴリ・名称（名称階層） | `id` (PK), `name`, `large_category_id` (FK), `vector`, `user_id`, `created_at` |
| `locations` | 保管場所 | `id` (PK), `name`, `vector`, `user_id`, `created_at` |
| `items` | 備蓄品・商品データ（品目） | `id` (PK), `name`, `life`（期限）, `purchase_timestamp`, `description`, `small_category_id` (FK), `location_id` (FK), `barcode_id` (FK), `vector`, `user_id`, `created_at` |
| `barcode_data` | バーコード（JAN）キャッシュと対応付け | `id` (PK), `jan_code`, `name`, `small_category_id` (FK), `user_id`, `created_at` |
