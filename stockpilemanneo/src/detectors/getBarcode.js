/**
 * @fileoverview The common component to detect a barcode.
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
 * Detect and returns the barcode data.
 * @param {File} file The file which the user handled.
 * @returns
 */
export default async function getBarcode(file) {
  if ('BarcodeDetector' in globalThis) {
    try {
      const formatsOptions = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
      /** @type {Array.<string>} */
      const supportedFormats = await BarcodeDetector.getSupportedFormats();
      const formats = formatsOptions.filter(value => supportedFormats.includes(value));
      if (formats.length == 0) {
        return `対応するフォーマットがありませんでした．対応フォーマットは${supportedFormats.join(', ')}です．`;
      }
      const barcodeDetector = new BarcodeDetector({
        formats,
      });
      /**
       * @type {?{
       *   rawValue: string,
       *   format: string,
       *   boundingBox: DOMRectReadOnly,
       *   cornerPoints: number[],
       * }[]}
       */
      const [{ rawValue }] = await barcodeDetector.detect(await createImageBitmap(file));
      return rawValue;
    } catch (e) {
      return e?.toString() ?? '';
    }
  } else {
    return 'バーコードの読み取りが可能なデバイスではありません．';
  }
}