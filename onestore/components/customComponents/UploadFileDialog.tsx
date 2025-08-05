"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { uploadFileAction } from "@/serverActions/s3Actions";
import { useParams } from "next/navigation";

// ✅ Schema
const formSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, { message: "File is required" }),
  kmsKeyId: z.string().optional(),
  directory: z.string(),
});

export function UploadFiles() {
  const params = useParams();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
      kmsKeyId: "",
      directory: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (values: {
    file: File;
    kmsKeyId?: string;
    directory: string;
  }) => {
    try {
      const res = await uploadFileAction(
        values.file,
        values.kmsKeyId,
        values.directory,
        params.id as string
      );
      if (res.success) {
        toast.success("File uploaded successfully");
      }

      closeRef.current?.click();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-20 ml-6 font-bold bg-orange-500 hover:bg-orange-600 cursor-pointer">
          Upload
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => {
                        field.onChange(e.target.files?.[0]);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kmsKeyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KMS Key ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave blank to use AWS-managed KMS"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="directory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Directory</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Directory" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" ref={closeRef}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
