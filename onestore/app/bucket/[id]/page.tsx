import S3FileCards from "@/components/customComponents/FileTable";
import { UploadFiles } from "@/components/customComponents/UploadFileDialog";
import { Button } from "@/components/ui/button";
import { listFiles } from "@/serverActions/s3Actions";
import { House } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async ({ params }: { params: any }) => {
  const id = (await params).id;
  const res = await listFiles(id);
  return (
    <div className="bg-black min-h-svh flex flex-col">
      <h1 className="text-5xl font-semibold p-6 text-center text-white tracking-wider">
        FILES
      </h1>
      <div className="flex flex-row items-center">
        <UploadFiles />
        <Button className="text-white ml-2 bg-blue-400 cursor-pointer">
          <Link href="/dashboard">
            <House />
          </Link>
        </Button>
      </div>
      <S3FileCards files={res.content} />
    </div>
  );
};

export default page;
