import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

/**
 * The barcode reader.
 * @param {import("html5-qrcode").Html5QrcodeCameraScanConfig & {onSuccess: import("html5-qrcode").QrcodeSuccessCallback, onError?: import("html5-qrcode").QrcodeErrorCallback, verbose?: boolean}} props The props.
 * @returns
 */
function BarcodeReader({ onSuccess, onError, verbose, ...config }) {
  const readerId = "qrcode-scan";

  useEffect(() => {
    if (!onSuccess) {
      throw new TypeError('`onSuccess` is needed.');
    }
    const html5QrScanner = new Html5QrcodeScanner(readerId, config, verbose);
    html5QrScanner.render(onSuccess, onError);

    return () => {
      html5QrScanner.clear().catch(err => {
        console.error('Failed to clear QR code scanner', err);
      });
    };
  });

  return (
    <div id={readerId} />
  );
}

export default BarcodeReader;