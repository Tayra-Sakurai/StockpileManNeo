/**
 * @fileoverview Barcode detecting script.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright (C) 2026 Tayra Sakurai
 * @license AGPL-3.0-or-later
 */

/**
 * Message handling system.
 * @param {MessageEvent<File>} event The event.
 */
async function onMessageReceive(event) {
  if ('BarcodeDetector' in globalThis) {
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
  }
}

addEventListener('message', onMessageReceive);
