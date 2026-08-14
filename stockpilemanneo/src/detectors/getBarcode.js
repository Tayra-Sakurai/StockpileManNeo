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