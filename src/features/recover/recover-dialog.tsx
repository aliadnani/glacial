import { Button } from "@/components/ui/button";

import {
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";

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
import { useEffect, useRef, useState } from "react";
import { decode } from "../z85";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";

class PageData {
  fileName: string;
  page: number;
  data: string;
  numberOfPages: number;

  constructor(rawData: string) {
    const splitData = rawData.split("~");
    this.data = splitData[0].replace("fileName=", "");
    this.fileName = splitData[1];

    const pageData = splitData[2];
    const currentPage = +pageData.split("/")[0].replace("pages=", "") - 1;
    const numberOfPages = +pageData.split("/")[1];
    this.page = currentPage;
    this.numberOfPages = numberOfPages;
  }
}

class ScanResult {
  fileName: string;
  numberOfPages: number;
  pages: string[];

  constructor(pageData: PageData) {
    this.fileName = pageData.fileName;
    this.numberOfPages = pageData.numberOfPages;

    this.pages = Array(this.numberOfPages).fill(undefined);
    this.pages[pageData.page] = pageData.data;
  }

  addPage(pageData: PageData) {
    this.pages[pageData.page] = pageData.data;

    return this;
  }

  decodePages() {
    const z85Encoded = this.pages.join("");

    console.log(z85Encoded);

    const decoded = decode(z85Encoded);

    return decoded;
  }
}

const scanRegionId = "html5qr-code-full-region";

type scanProps = Html5QrcodeScannerConfig & {
  qrCodeSuccessCallback: QrcodeSuccessCallback;
  verbose?: boolean;
  qrCodeErrorCallback?: QrcodeErrorCallback;
};

export const Html5QrcodeScan = (props: scanProps) => {
  const { qrCodeSuccessCallback, qrCodeErrorCallback, verbose } = props;
  const ref = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Use reference to avoid recreating the object when double rendered in Dev Strict Mode.
    if (ref.current === null) {
      ref.current = new Html5QrcodeScanner(scanRegionId, { ...props }, verbose);
    }
    const html5QrcodeScanner = ref.current;

    // Timeout to allow the clean-up function to finish in case of double render.
    setTimeout(() => {
      const container = document.getElementById(scanRegionId);
      if (html5QrcodeScanner && container?.innerHTML == "") {
        html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);
      }
    }, 0);

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
      }
    };
    // Just once when the component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={scanRegionId} />;
};

function RecoverDialog() {
  const [scanResult, setScanResult] = useState<ScanResult>();
  const stateRef = useRef<ScanResult>();

  stateRef.current = scanResult;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Start Scanning</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-[350px] ">
          <Html5QrcodeScan
            formatsToSupport={[Html5QrcodeSupportedFormats.QR_CODE]}
            defaultZoomValueIfSupported={1.5}
            fps={30}
            qrbox={{ width: 250, height: 250 }}
            aspectRatio={1}
            qrCodeSuccessCallback={(raw: string) => {
              const pageData = new PageData(raw);
              const scanResultRef = stateRef.current;
              if (scanResultRef) {
                const scanResultWithAddedPage = scanResultRef.addPage(pageData);
                console.log("added");
                console.log(scanResultWithAddedPage);

                console.log(
                  `scanned ${scanResultWithAddedPage.pages.filter((d) => !!d).length}`,
                );

                if (
                  scanResultWithAddedPage.pages.filter((d) => !!d).length ==
                  scanResultWithAddedPage.numberOfPages
                ) {
                  const decodedUint8Array =
                    scanResultWithAddedPage.decodePages();

                  const url = window.URL.createObjectURL(
                    new Blob([decodedUint8Array], {
                      type: "application/octet-stream",
                    }),
                  );
                  const a = document.createElement("a");
                  document.body.appendChild(a);
                  a.href = url;
                  a.download = `glacial-recovered-${scanResultWithAddedPage.fileName}`;
                  a.click();
                  window.URL.revokeObjectURL(url);

                  document.body.removeChild(a);
                  alert("yes");
                }

                setScanResult(scanResultWithAddedPage);
              } else {
                const newScanResult = new ScanResult(pageData);
                console.log("new");
                // console.log(newScanResult)
                setScanResult(newScanResult);
              }
            }}
          />
        </div>
        <div>
          <div>
            <Badge className="text-sm">Scanned 1/6</Badge>
            <div>
              <Badge variant="secondary">1</Badge>
            </div>
          </div>
          <div>
            <Badge className="text-sm">Pending 5/6</Badge>
            <div>
              <Badge variant="secondary">2</Badge>
              <Badge variant="secondary">3</Badge>
              <Badge variant="secondary">4</Badge>
              <Badge variant="secondary">5</Badge>
              <Badge variant="secondary">6</Badge>
            </div>
            <Button disabled>Recover</Button>
          </div>
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export {RecoverDialog}