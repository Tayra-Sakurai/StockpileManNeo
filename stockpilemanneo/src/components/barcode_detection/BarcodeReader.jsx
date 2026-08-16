import { Button, FormControl, Grid, MenuItem, Select } from "@mui/material";
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
    const load = async () => {
      setCameras(await Html5Qrcode.getCameras());
    };

    load();

    return () => {
      qrScannerRef.current?.clear();
    };
  }, [onSuccess, config, onError]);

  return (
    <Grid columns={12} container>
      <Grid size={12}>
        <div id="qrcode-scan" />
      </Grid>
      <Grid size="auto">
        <FormControl>
          <Select
            value={camera}
            label="カメラ"
            onChange={event => setCamera(event.target.value)}
          >
            {cameras.map(value => <MenuItem value={value.id}>value.label</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size="grow">
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={() => qrScannerRef.current?.start(camera, cameraScanConfig, onSuccess, onError)}
          disabled={!camera}
          startIcon={<BarcodeReaderIcon />}
        >
          スキャンを開始する．
        </Button>
      </Grid>
    </Grid>
  );
}

export default BarcodeReader;