import { Button, Container, FormControl, Grid, MenuItem, Select, Stack } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import BarcodeReaderIcon from "@mui/icons-material/BarcodeReader";

/**
 * The camera scanning configurations.
 * @type {import("html5-qrcode").Html5QrcodeCameraScanConfig}
 */
const cameraScanConfig = {
  fps: 10,
  aspectRatio: 16 / 9,
  disableFlip: false,
  qrbox: 250,
};

/**
 * The barcode reader.
 * @param {import("html5-qrcode").Html5QrcodeFullConfig & {onSuccess: import("html5-qrcode").QrcodeSuccessCallback, onError?: import("html5-qrcode").QrcodeErrorCallback}} props The props.
 * @returns
 */
function BarcodeReader({ onSuccess, onError, ...config }) {
  const readerId = "qrcode-scan";

  /**
   * @type{[
   *   string,
   *   import("react").Dispatch.<import("react").SetStateAction.<string>>
   * ]}
   */
  const [camera, setCamera] = useState('');

  /**
   * @type{[
   *   import("html5-qrcode").CameraDevice[],
   *   import("react").Dispatch.<import("react").SetStateAction.<import("html5-qrcode").CameraDevice[]>>
   * ]}
   */
  const [cameras, setCameras] = useState([]);

  /**
   * @type {import("react").RefObject<?Html5Qrcode>}
   */
  const qrScannerRef = useRef(null);

  useEffect(() => {
    qrScannerRef.current = new Html5Qrcode(readerId, config);

    Html5Qrcode
      .getCameras()
      .then(values => setCameras(values));

    return () => {
      qrScannerRef.current?.clear();
    };
  }, [config]);

  return (
    <Stack spacing={2}>
      <Container>
        <div id={readerId} />
      </Container>

      <Select
        value={camera}
        onChange={event => setCamera(event.target.value)}
        fullWidth
        label="カメラ"
      >
        {cameras.map(({ id, label }) => <MenuItem value={id}>{label}</MenuItem>)}
      </Select>

      <Button
        onClick=
      >
      </Button>
    </Stack>
  );
}

export default BarcodeReader;