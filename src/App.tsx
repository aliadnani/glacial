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
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { P } from "./components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { QRCodeSVG } from "qrcode.react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { encode } from "./features/z85";
import { ArchiveForm } from "./features/archive/archive-form";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="mx-auto max-w-7xl p-8 space-y-4 flex flex-col justify-center items-center">
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>
            <P className="font-bold text-lg">Glacial</P>
          </div>
          <Separator orientation="vertical" />
          <div>
            <P>QR-based data archival and retrieval</P>
          </div>
        </div>
        <Tabs defaultValue="archive" className="w-[520px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="archive">Archive</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve</TabsTrigger>
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
              <CardFooter>{/* ??? */}</CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="retrieve">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you'll be logged out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
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
