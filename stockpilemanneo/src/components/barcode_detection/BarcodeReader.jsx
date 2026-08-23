/**
 * @fileoverview The barcode reader.
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
import { Button, Container, FormControl, InputLabel, MenuItem, Select, Stack } from "@mui/material";
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
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  /**
   * @type {import("html5-qrcode").QrcodeSuccessCallback}
   */
  const handleSuccess = (...params) => {
    if (qrScannerRef.current && onSuccessRef.current) {
      onSuccessRef.current(...params);
      if (qrScannerRef.current.isScanning) {
        qrScannerRef.current
          .stop()
          .then(() => {
            setIsScanning(false);
            setIsPaused(false);
          })
          .catch(err => {
            console.error("Failed to stop qr scanner:", err);
            setIsScanning(false);
          });
      } else {
        setIsScanning(false);
        setIsPaused(false);
      }
    }
  };

  useEffect(() => {
    qrScannerRef.current ??= new Html5Qrcode(readerId, config);

    if (cameras.length == 0)
      Html5Qrcode
        .getCameras()
        .then(values => setCameras(values))
        .catch(err => console.error("Failed to get cameras:", err));

    return () => {
      if (qrScannerRef.current?.isScanning) {
        qrScannerRef.current.stop().catch(() => {}).finally(() => {
          qrScannerRef.current?.clear();
        });
      } else {
        qrScannerRef.current?.clear();
      }
    };
  }, []);

  return (
    <Stack spacing={2}>
      <Container>
        <div id={readerId} />
      </Container>

      <FormControl>
        <InputLabel id="qrscan-camera-label">カメラ</InputLabel>
        <Select
          labelId="qrscan-camera-label"
          value={camera}
          onChange={event => setCamera(event.target.value)}
          fullWidth
          label="カメラ"
        >
          {cameras.map(({ id, label }) => <MenuItem key={id} value={id}>{label}</MenuItem>)}
        </Select>
      </FormControl>

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