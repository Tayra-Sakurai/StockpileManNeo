/**
 * @fileoverview Constants and tool schemas for Gemini Live talking session.
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

export const DEFAULT_LIVE_MODEL = 'models/gemini-3.1-flash-live-preview';

export const LIVE_MODELS = [
  { value: 'models/gemini-3.1-flash-live-preview', label: 'Gemini 3.1 Flash (Preview)' },
];

export const LIVE_VOICES = [
  { name: 'Puck', label: 'Puck (標準・親しみやすい)', description: 'バランスの取れた自然なトーン' },
  { name: 'Charon', label: 'Charon (落ち着いた低音)', description: '深みのある信頼感のある声' },
  { name: 'Kore', label: 'Kore (クリア・穏やか)', description: '穏やかで聞き取りやすい声' },
  { name: 'Fenrir', label: 'Fenrir (明瞭・力強い)', description: 'ハキハキとしたエネルギッシュな声' },
  { name: 'Aoede', label: 'Aoede (温かみ・親切)', description: '明るく親切なトーン' },
];

const dateConverter = new Intl.DateTimeFormat('ja-JP', {
  dateStyle: 'full',
  timeZone: 'Asia/Tokyo',
});

/**
 * Generates the system instruction for the live conversation.
 * @returns {string}
 */
export function getLiveSystemInstruction() {
  const todayStr = dateConverter.format(new Date());

  return `# 基本設定
今日は ${todayStr} です。

あなたの名前は「StockpileMan Neo Agent」です。備蓄品・在庫管理アプリ「StockpileMan Neo」の音声対話アシスタントです。
ユーザーとリアルタイムの音声通話を行っています。

# 役割と振る舞い
1. ユーザーからの質問に応じて、提供されているデータベース検索ツールを呼び出して最新の在庫・分類・保管場所・賞味期限の情報を取得し、簡潔で分かりやすい日本語で回答してください。
2. 音声会話であるため、長大な一覧を一気に読み上げるのではなく、要点を絞って会話形式で自然に伝えてください。必要に応じて「さらに詳しく聞きますか？」と問いかけてください。
3. ユーザーがどんな言語で話しかけても、常に日本語で返答してください。

# アプリ内の用語定義
- 大分類 (the largest category): 食品・生活用品などの最上位分類
- 小分類 (large category): 大分類の中分類（例: レトルト食品、飲料など）
- 名称 (small category): 品目の具体的な名称分類（例: カレー、ミネラルウォーターなど）
- 商品名 (product name): 個々の登録品目名
- 保管場所 (places / locations): パントリー、防災リュック、キッチン棚など

# ツール利用の指針
- 在庫や品目について尋ねられたら、速やかに 'getItems' や 'getItemsWithDateRange' などのツールを実行してください。
- 分類や保管場所について尋ねられたら、'getLargeLargeCategories', 'getLargeCategories', 'getSmallCategories', 'getPlaces' を活用してください。
- 該当するデータが見つからない場合は、データベースにまだ登録されていない可能性がある旨を伝え、アプリから追加登録することを提案してください。

# 開発者へのお問い合わせ
- 要望やバグ報告の問い合わせがあった場合は、GitHub リポジトリの Issue ページ (https://github.com/Tayra-Sakurai/StockpileManNeo/issues) を案内してください。
`;
}

/**
 * Gemini Live API function declarations matching DbFunctions.js.
 */
export const liveFunctionDeclarations = [
  {
    name: 'getLargeLargeCategories',
    description: 'データベースからすべての大分類（最上位カテゴリ）の一覧を取得します。',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'getLargeCategories',
    description: '指定した大分類IDに紐づく小分類の一覧を取得します。',
    parameters: {
      type: 'OBJECT',
      properties: {
        largeLargeCategoryId: {
          type: 'NUMBER',
          description: '大分類のID',
        },
      },
      required: ['largeLargeCategoryId'],
    },
  },
  {
    name: 'getSmallCategories',
    description: '指定した小分類IDに紐づく名称（品目分類）の一覧を取得します。',
    parameters: {
      type: 'OBJECT',
      properties: {
        largeCategoryId: {
          type: 'NUMBER',
          description: '小分類のID',
        },
      },
      required: ['largeCategoryId'],
    },
  },
  {
    name: 'getItems',
    description: '指定した名称IDに紐づく品目一覧を取得します。名称IDを指定しない場合はすべての品目を取得します。',
    parameters: {
      type: 'OBJECT',
      properties: {
        smallCategoryId: {
          type: 'NUMBER',
          description: '名称（品目分類）のID（省略可能）',
        },
      },
      required: [],
    },
  },
  {
    name: 'getItemsWithDateRange',
    description: '賞味期限・消費期限の日付範囲に該当する品目を検索します。日付はISO形式（YYYY-MM-DD）です。rangeEndを省略した場合は指定日以前に期限が切れる品目を検索します。',
    parameters: {
      type: 'OBJECT',
      properties: {
        rangeStart: {
          type: 'STRING',
          description: '範囲開始日または単一指定日 (YYYY-MM-DD)',
        },
        rangeEnd: {
          type: 'STRING',
          description: '範囲終了日 (YYYY-MM-DD, 省略可能)',
        },
      },
      required: ['rangeStart'],
    },
  },
  {
    name: 'getPlaces',
    description: '品目が保管されているすべての保管場所の一覧を取得します。',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];
