import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
} from "@/components/ui/select";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { HiddenQrPage } from "./hidden-qr-page";

const formSchema = z.object({
  fileName: z.string(),
  bytesPerQrCode: z.string(),
  maxQrCodesPerPage: z.number().min(6).max(6),
  pageSize: z.enum(["A4"]),
});

function ArchiveForm() {
  const [file, setFile] = useState<File>();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    preserveAfterPrint: true,
  });

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
                    <SelectValue placeholder="Select" defaultValue={"628"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={"628"}>628 Bytes</SelectItem>
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
          onClick={() => reactToPrintFn()}
          disabled={!form.formState.isValid}
        >
          Print QR Codes
        </Button>
      </form>
      <div ref={contentRef} className="hide-for-print">
        <HiddenQrPage file={file} bytesPerQrCode={256} />
      </div>
    </Form>
  );
}

export { ArchiveForm };
