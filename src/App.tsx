import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { P } from "./components/ui/typography";

import { ArchiveForm } from "./features/archive/archive-form";
import { useRef, useState } from "react";
import {
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";

import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { Badge } from "./components/ui/badge";
import { decode } from "./features/z85";

const qrcodeRegionId = "html5qr-code-full-region";

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

    console.log(z85Encoded)

    const decoded = decode(z85Encoded);

    return decoded;
  }
}

const Html5QrcodePlugin = (props) => {
  useEffect(() => {
    // when component mounts
    const verbose = props.verbose === true;
    // Suceess callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw "qrCodeSuccessCallback is required callback.";
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      {
        fps: 30,
        aspectRatio: 1,
      },
      verbose,
    );
    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback,
    );

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};

function App() {
  const [scanResult, setScanResult] = useState<ScanResult>();
  const stateRef = useRef<ScanResult>();

  stateRef.current = scanResult;

  // useEffect(() => {
  //   console.log(scanResult)

  // }, [scanResult])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="mx-auto max-w-2xl p-4 space-y-4 flex flex-col justify-center items-center">
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>
            <P className="font-bold text-lg">Glacial</P>
          </div>
          <Separator orientation="vertical" />
          <div>
            <P>QR-based data archival and retrieval</P>
          </div>
        </div>
        <Tabs defaultValue="archive">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="archive">Archive</TabsTrigger>
            <TabsTrigger value="recover">Recover</TabsTrigger>
          </TabsList>
          <TabsContent value="archive">
            <Card>
              <CardHeader>
                <CardTitle>Archive</CardTitle>
                <CardDescription>
                  Encode your data as QR codes and print them out for long term
                  offline storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ArchiveForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recover">
            <Card>
              <CardHeader>
                <CardTitle>Recover</CardTitle>
                <CardDescription>
                  Recover data from printed out glacial QR codes. Do this on a
                  phone with a decent back camera.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Dialog>
                  <DialogTrigger>Start Scanning</DialogTrigger>
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
                        qrCodeSuccessCallback={(raw) => {
                          const pageData = new PageData(raw);
                          const scanResultRef = stateRef.current;
                          if (scanResultRef) {
                            const scanResultWithAddedPage =
                              scanResultRef.addPage(pageData);
                            console.log("added");
                            console.log(scanResultWithAddedPage);

                            console.log(
                              `scanned ${scanResultWithAddedPage.pages.filter((d) => !!d).length}`,
                            );

                            if (
                              scanResultWithAddedPage.pages.filter((d) => !!d)
                                .length == scanResultWithAddedPage.numberOfPages
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
                              alert("yes")
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
                      <Badge className="text-sm">Scanned 1/6</Badge>
                      <div>
                        <Badge variant="secondary">Page 1</Badge>
                      </div>
                    </div>
                    <div>
                      <Badge className="text-sm">Pending 5/6</Badge>
                      <div>
                        <Badge variant="secondary">Page 2</Badge>
                        <Badge variant="secondary">Page 3</Badge>
                        <Badge variant="secondary">Page 4</Badge>
                        <Badge variant="secondary">Page 5</Badge>
                        <Badge variant="secondary">Page 6</Badge>
                      </div>
                      <Button disabled>Recover</Button>
                    </div>
                    <DialogFooter></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
              <CardFooter>{/* ??? */}</CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
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

export default App;
