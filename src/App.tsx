import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { P } from "@/components/ui/typography";

import { ArchiveForm } from "./features/archive/archive-form";
import { useRef } from "react";
import {
  Html5QrcodeScanner,
  QrcodeErrorCallback,
  QrcodeSuccessCallback,
} from "html5-qrcode";

import { useEffect } from "react";
import GlacialLogo from "./assets/glacial-logo.svg?react";
import GlacialLogoDark from "./assets/glacial-logo-dark.svg?react";

import { Html5QrcodeScannerConfig } from "html5-qrcode/esm/html5-qrcode-scanner";
import { RecoverDialog } from "./features/recover/recover-dialog";

function App() {
const theme = 'dark'

  return (
    <ThemeProvider defaultTheme={theme} storageKey="vite-ui-theme">
      <div className="mx-auto max-w-2xl p-4 space-y-4 flex flex-col justify-center items-center">
        <div className="flex h-5 items-center space-x-2 text-sm">
          {theme ==='dark' ? <GlacialLogoDark className="w-6"/> :<GlacialLogo className="w-6"/>  }
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
                  <br />
                  <br />
                  The recovered file will automatically download once scanning
                  is complete.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <RecoverDialog />
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
