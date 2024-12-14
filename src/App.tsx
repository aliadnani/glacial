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
import { encode } from "./z85";

const formSchema = z.object({
  fileName: z.string(),
  bytesPerQrCode: z.string(),
  maxQrCodesPerPage: z.number().min(6).max(6),
  pageSize: z.enum(["A4"]),
});

function ArchiveForm() {
  const [file, setFile] = useState<File>();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bytesPerQrCode: "628",
      maxQrCodesPerPage: 6,
      pageSize: "A4",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* File Input */}
        <FormField
          control={form.control}
          name="fileName"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>File</FormLabel>

              <FormDescription>
                Upload a file to encode your data as QR codes.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setFile(e.target.files?.[0] as File);
                  }}
                />
              </FormControl>
              <FormMessage>
                {form.formState.errors.fileName?.message?.toString()}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Bytes per QR Code */}
        <FormField
          control={form.control}
          name="bytesPerQrCode"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Max Bytes per QR Code</FormLabel>
              <FormDescription>
                Specify the number of max bytes each QR code should encode.
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value.toLocaleString()}
              >
                <FormControl>
                  <SelectTrigger className="w-32" disabled>
                    <SelectValue placeholder="Select" defaultValue={"628"}/>
                  </SelectTrigger>
                  {/* <Input type="number" {...field} /> */}
                </FormControl>
                <SelectContent>
                  {/* <SelectItem value={"32"}>32 Bytes</SelectItem>
                  <SelectItem value={"128"}>128 Bytes</SelectItem> */}
                  <SelectItem value={"628"}>628 Bytes</SelectItem>
                  {/* <SelectItem value={"2048"}>2048 Bytes</SelectItem> */}
                </SelectContent>
              </Select>

              <FormMessage>
                {form.formState.errors.bytesPerQrCode?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Max QR Codes per Page */}
        <FormField
          control={form.control}
          name="maxQrCodesPerPage"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Max QR Codes per Page</FormLabel>
              <FormDescription>
                Specify the maximum number of QR codes that can fit on a single
                page. (WIP - only 6 right now)
              </FormDescription>
              <FormControl>
                <Input className="w-32" type="number" {...field} disabled />
              </FormControl>

              <FormMessage>
                {form.formState.errors.maxQrCodesPerPage?.message}
              </FormMessage>
            </FormItem>
          )}
        />

        {/* Page Size */}
        <FormField
          control={form.control}
          name="pageSize"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Page Size</FormLabel>
              <FormDescription>
                Specify the size of each page. (WIP - only A4 right now)
              </FormDescription>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled
              >
                <FormControl>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          className="my-4"
          type="submit"
          onClick={reactToPrintFn}
          disabled={!form.formState.isValid}
        >
          Generate QR Codes
        </Button>
      </form>
      <div  ref={contentRef}  className="hide-for-print">
        <QrCodeHiddenPage file={file as File} bytesPerQrCode={256} />
        {/* <Button onClick={reactToPrintFn}>Print</Button> */}
      </div>
    </Form>
  );
}

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

interface QrCodeHiddenPageProps {
  file: File;
  bytesPerQrCode: number;
}

function QrCodeHiddenPage(props: QrCodeHiddenPageProps) {
  const { file } = props;
  const [z85Strings, setZ85Strings] = useState<string[]>();

  useEffect(() => {
    async function awaitArrayBuffer() {
      const awaitedArrayBuffer = await file.arrayBuffer();
      const int8Array = new Uint8Array(awaitedArrayBuffer);

      const chunkedInt8Arrays = chunk(int8Array, 628);
      const z85edArrayBuffers = chunkedInt8Arrays.map((buf) => encode(buf));
      z85edArrayBuffers[z85edArrayBuffers.length - 1] = `${z85edArrayBuffers[z85edArrayBuffers.length - 1]},fileName=${file.name}`
      console.log(z85edArrayBuffers);
      setZ85Strings(z85edArrayBuffers);
    }
    if (!z85Strings) {
      awaitArrayBuffer();
    }
  }, [file, z85Strings]);

  return (
    <>
      {
        z85Strings && <StringTables strings={z85Strings} />
      }
    </>
  );
}

function chunk(input: Uint8Array, sizePerChunk: number): Uint8Array[] {
  // Check if the size is valid
  if (sizePerChunk <= 0) {
    throw new Error("Chunk size must be a positive integer");
  }

  const result: Uint8Array[] = [];
  const totalChunks = Math.ceil(input.length / sizePerChunk);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * sizePerChunk;
    const end = Math.min(start + sizePerChunk, input.length);
    const chunk = input.subarray(start, end);
    result.push(chunk);
  }

  return result;
}

interface Props {
  strings: string[];
}

const StringTables: React.FC<Props> = ({ strings }) => {
  // Number of elements per table (2 columns x 3 rows)
  const elementsPerTable = 6;

  // Calculate the number of tables needed
  const numTables = Math.ceil(strings.length / elementsPerTable);

  return (
    <div>
      {Array.from({ length: numTables }, (_, tableIndex) => {
        // Get the start and end index for slicing the strings array
        const startIndex = tableIndex * elementsPerTable;
        const endIndex = startIndex + elementsPerTable;
        const currentTableStrings = strings.slice(startIndex, endIndex);

        return (
          <>
            <div className="page-break" />

            <p className="text-sm">
              glacial | scan top to bottom, left to right | page{" "}
              {tableIndex + 1}/{numTables}
            </p>
            <table key={tableIndex}>
              <tbody>
                {Array.from({ length: 3 }, (_, rowIndex) => (
                  <tr key={rowIndex}>
                    {/* Map over each column in the current row */}
                    {Array.from({ length: 2 }, (_, colIndex) => {
                      const stringIndex = rowIndex * 2 + colIndex;
                      return (
                        <td key={colIndex}>
                          {stringIndex < currentTableStrings.length ? (
                            <QRCodeSVG
                              size={322}
                              value={strings[stringIndex]}
                              marginSize={2}
                            />
                          ) : (
                            ""
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        );
      })}
    </div>
  );
};

export default App;
