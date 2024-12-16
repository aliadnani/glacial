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
import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props) => {
  let config = {};
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};

const Html5QrcodePlugin = (props) => {
  useEffect(() => {
    // when component mounts
    const config = createConfig(props);
    const verbose = props.verbose === true;
    // Suceess callback is required.
    if (!props.qrCodeSuccessCallback) {
      throw "qrCodeSuccessCallback is required callback.";
    }
    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
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
  const onNewScanResult = (decodedText, decodedResult) => {
    // handle decoded results here
  };

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
                  <DialogTrigger>Open</DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
                <Button>Start Scanning</Button>
              </CardContent>
              <CardFooter>{/* ??? */}</CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}

export default App;
