"use client";

import { useForm } from "react-hook-form";
import { boolean, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { createBucket } from "@/serverActions/s3Actions";

// ✅ Define schema using Zod
const formSchema = z.object({
  name: z.string().min(1, "Bucket name is required"),
  useKms: z.boolean(),
  region: z.string(),
});

export function CreateBucket() {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // ✅ Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      useKms: false,
      region: "",
    },
  });
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);
  // ✅ Handle form submit
  const onSubmit = async (values: {
    name: string;
    useKms: boolean;
    region: string;
  }) => {
    const res = await createBucket(values.name, values.useKms, values.region);
    if (res.success) {
      toast.success("Bucket Created Successfully");
    } else {
      toast.error(res.error);
    }
    closeRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-20 ml-6 font-bold bg-orange-500 hover:bg-orange-500 cursor-pointer">
          Create
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Bucket</DialogTitle>
        </DialogHeader>

        {/* Form wrapper */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Bucket name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Region name" {...field} />
                  </FormControl>
                  <FormLabel className="text-red-500">
                    Enter Region if not us-east-1
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="useKms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                  <FormLabel className="text-black">Enable KMS</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button" ref={closeRef}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
