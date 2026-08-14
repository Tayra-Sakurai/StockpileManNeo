/**
 * @fileoverview Barcode detecting script.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright (C) 2026 Tayra Sakurai
 * @license AGPL-3.0-or-later
 */

console.log('Hello.');
postMessage('Hello UI.');

/**
 * Message handling system.
 * @param {MessageEvent<File>} event The event.
 */
async function onMessageReceive(event) {
  console.info('Worker has received the message.');
  if ('BarcodeDetector' in globalThis) {
    postMessage(await BarcodeDetector.getSupportedFormats());
    const barcodeDetector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
    });
    const imageBitmap = await createImageBitmap(event.data);
    /**
     * @type {{
     *   rawValue: string,
     *   [x: string]: any,
     * }[]}
     */
    const [{ rawValue }] = await barcodeDetector.detect(imageBitmap);
    postMessage(rawValue);
  } else {
    postMessage(null);
  }
}

addEventListener('message', onMessageReceive);
