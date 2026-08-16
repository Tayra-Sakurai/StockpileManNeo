import { Button, Container, FormControl, Grid, MenuItem, Select, Stack } from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import BarcodeReaderIcon from "@mui/icons-material/BarcodeReader";
import StopIcon from "@mui/icons-material/Stop";

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

  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * @type {import("react").RefObject<?Html5Qrcode>}
   */
  const qrScannerRef = useRef(null);

  /**
   * @type {import("html5-qrcode").QrcodeSuccessCallback}
   */
  const handleSuccess = (...params) => {
    if (qrScannerRef.current && isScanning && onSuccess) {
      onSuccess(...params);
      qrScannerRef.current.stop();
      setIsScanning(false);
    }
  };

  useEffect(() => {
    qrScannerRef.current ??= new Html5Qrcode(readerId, config);

    if (cameras.length == 0)
      Html5Qrcode
        .getCameras()
        .then(values => setCameras(values));

    return () => {
      qrScannerRef.current?.clear();
    };
  }, []);

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
        onClick={() => {
          if (!isPaused)
            qrScannerRef.current?.start(camera, cameraScanConfig, handleSuccess, onError);
          else
            qrScannerRef.current?.resume();
          setIsScanning(true);
          setIsPaused(false);
        }}
        type="button"
        variant="contained"
        color="primary"
        startIcon={<BarcodeReaderIcon />}
        disabled={!camera || isScanning}
      >
        スキャン開始
      </Button>

      <Button
        type="button"
        color="secondary"
        variant="contained"
        startIcon={<StopIcon />}
        disabled={!camera || !isScanning}
        onClick={() => {
          qrScannerRef.current?.pause(false);
          setIsScanning(false);
          setIsPaused(true);
        }}
      >
        スキャンを停止
      </Button>
    </Stack>
  );
}

export default BarcodeReader;