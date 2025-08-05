"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storeS3Creds } from "@/serverActions/s3Actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
  accessKey: z.string().min(1, "access key is required"),
  secretKey: z.string().min(1, "secret key is required"),
  region: z.string().min(1, "region is required"),
  sessionToken: z.string(),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      accessKey: "",
      secretKey: "",
      region: "",
      sessionToken: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await storeS3Creds(
        values.accessKey,
        values.secretKey,
        values.region,
        values.sessionToken
      );
      toast.success("s3 access successfull");
      router.push("/dashboard");
    } catch (error) {
      toast.error("s3 access unsuccessfull");
    }
  };

  return (
    <div className="max-w-md w-full rounded-2xl border bg-white p-8 shadow-xl dark:bg-zinc-900 dark:border-zinc-800">
      <h2 className="mb-6 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
        Sign in to your account
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accessKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Key</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your access key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secretKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret Key</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your secret key"
                    {...field}
                  />
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
                <FormLabel>region</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your region" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sessionToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>sessionToken</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your sessionToken" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </Form>
    </div>
  );
}
