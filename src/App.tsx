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

function App() {
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
                <P className="text-sm  text-rose-900">
                  WIP: UI to scan glacial-generated QR codes. QRs contain
                  filename and page data too - so validation is possible too. https://scanapp.org/ is a good reference.
                </P>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}

export default App;
