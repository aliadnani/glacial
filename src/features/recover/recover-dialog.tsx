import { Button } from "@/components/ui/button";

import { Html5QrcodeSupportedFormats } from "html5-qrcode";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { decode } from "../z85";
import { Html5QrcodeScannerComponent } from "./qr-scanner";
import { P } from "@/components/ui/typography";
import { Download } from "lucide-react";
import { downloadBinary } from "./utils";

interface QrData {
  data: string;
  fileName: string;
  qr: number;
  numberOfQrs: number;
}

function makeQrData(rawData: string): QrData {
  const splitData = rawData.split("~");

  const qrData = splitData[2];
  const currentQr = +qrData.split("/")[0].replace("qr=", "") - 1;
  const numberOfQrs = +qrData.split("/")[1];
  return {
    data: splitData[0].replace("fileName=", ""),
    fileName: splitData[1],
    qr: currentQr,
    numberOfQrs: numberOfQrs,
  };
}

function makeNewScanResult(qrData: QrData): ScanResult {
  const qrs = Array(qrData.numberOfQrs).fill(undefined);
  qrs[qrData.qr] = qrData.data;
  return {
    fileName: qrData.fileName,
    numberOfQrs: qrData.numberOfQrs,
    qrs: qrs,
  };
}

function addQrToExistingScanResult(scanResult: ScanResult, qrData: QrData) {
  scanResult.qrs[qrData.qr] = qrData.data;

  return scanResult;
}

interface ScanResult {
  fileName: string;
  numberOfQrs: number;
  qrs: string[];
}

interface RecoverResultDisplayProps {
  scanResult: ScanResult;
}

function downloadScanResult(scanResult: ScanResult) {
  downloadBinary(scanResult.fileName, scanResultQrsToBinary(scanResult));
}

function scanResultQrsToBinary(scanResult: ScanResult) {
  return decode(scanResult.qrs.join(""));
}

function RecoverResultDisplay(props: RecoverResultDisplayProps) {
  const { scanResult } = props;

  const pendingQrs = Array.from(scanResult.qrs, (_, i) => i).filter(
    (i) => scanResult.qrs[i] === undefined,
  );
  const scannedQrs = [...Array(scanResult.numberOfQrs).keys()].filter(
    (n) => !pendingQrs.includes(n),
  );

  return (
    <div>
      <div className="flex flex-col m-auto text-left">
        <div>
          <Badge className="text-sm my-2 text">
            Scanned {scannedQrs.length}/{scanResult.numberOfQrs}
          </Badge>
          <div>
            {scannedQrs.map((idx) => (
              <Badge variant="secondary" className="mr-2">
                {idx + 1}
              </Badge>
            ))}
            {/* <Badge variant="secondary">1</Badge> */}
          </div>
        </div>
        <div>
          <Badge className="text-sm my-2">
            Pending {pendingQrs.length}/{scanResult.numberOfQrs}
          </Badge>
          <div>
            {pendingQrs.map((idx) => (
              <Badge variant="secondary" className="mr-2">
                {idx + 1}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function isScanningComplete(scanResult: ScanResult | undefined) {
  if (scanResult) {
    return scanResult.qrs.filter((q) => !!q).length == scanResult.numberOfQrs;
  } else {
    return false;
  }
}

function CompleteScanningMessage(props: { scanResult: ScanResult }) {
  const { scanResult } = props;
  return (
    <div>
      <P className="text-sm">
        All QR codes have successfully scanned and the recovered file should
        have been downloaded. If not - feel free to try the below link to
        download again. Otherwise, you may close this dialog.
      </P>
      <Button
        variant="link"
        className="p-0"
        onClick={() => downloadScanResult(scanResult)}
      >
        <Download />
        {`Download '${scanResult.fileName}'`}
      </Button>
    </div>
  );
}

function RecoverDialogScanning(props: {
  scanResult?: ScanResult;
  setScanResult: React.Dispatch<React.SetStateAction<ScanResult | undefined>>;
}) {
  const { scanResult, setScanResult } = props;
  return (
    <div>
      <div className="w-full min-w-[280px]">
        <Html5QrcodeScannerComponent
          formatsToSupport={[Html5QrcodeSupportedFormats.QR_CODE]}
          defaultZoomValueIfSupported={1.5}
          fps={30}
          qrbox={(w, h) => ({ width: w * 0.8, height: h * 0.8 })}
          aspectRatio={1}
          qrCodeSuccessCallback={(raw: string) => {
            const qrData = makeQrData(raw);

            setScanResult((latestScanResult) => {
              console.log(latestScanResult);

              if (latestScanResult) {
                const scanResultWithAddedQr = addQrToExistingScanResult(
                  latestScanResult,
                  qrData,
                );

                return structuredClone(scanResultWithAddedQr);
              } else {
                const newScanResult = makeNewScanResult(qrData);
                return structuredClone(newScanResult);
              }
            });
          }}
        />
      </div>
      {scanResult && <RecoverResultDisplay scanResult={scanResult} />}
    </div>
  );
}

function RecoverDialog() {
  const [scanResult, setScanResult] = useState<ScanResult>();
  const scanningIsComplete = isScanningComplete(scanResult);

  useEffect(() => {
    if (scanningIsComplete && scanResult) {
      downloadScanResult(scanResult);
    }
  }, [scanResult, scanningIsComplete]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Start Scanning</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left">Scan</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {scanningIsComplete ? (
          <CompleteScanningMessage scanResult={scanResult as ScanResult} />
        ) : (
          <RecoverDialogScanning
            setScanResult={setScanResult}
            scanResult={scanResult}
          />
        )}

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { RecoverDialog };
