// components/S3FileTable.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  deleteFileFromS3,
  getPresignedDownloadUrl,
} from "@/serverActions/s3Actions";
import { Delete, Download } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function S3FileTable({ files }: { files: any }) {
  const params = useParams();
  const removeFile = async (bucket: string, key: string) => {
    const res = await deleteFileFromS3(bucket, key);
    if (res.success) {
      toast.success("File Deleted successfully");
    } else {
      toast.error("Deletion Failed");
    }
  };
  const handleDownload = async (bucket: string, key: string) => {
    const res = await getPresignedDownloadUrl(bucket, key);
    if (res.success && res.url) {
      window.open(res.url,"_blank");
    } else {
      toast.error("Failed to get download link");
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center text-2xl text-red-500 font-bold">
        NO FILES FOUND
      </div>
    );
  }

  return (
    <div className="overflow-x-auto m-5">
      <table className="min-w-full text-sm text-left bg-black text-white rounded-lg">
        <thead className="bg-gray-800 text-white uppercase text-xs">
          <tr>
            <th className="px-4 py-3">File Name</th>
            <th className="px-4 py-3">Last Modified</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file: any) => (
            <tr
              key={file.Key}
              className="border-b border-gray-700 hover:bg-gray-900 transition"
            >
              <td className="px-4 py-3 break-all font-semibold">{file.Key}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(file.LastModified).toISOString()}
              </td>
              <td className="px-4 py-3">{formatBytes(file.Size)}</td>
              <td className="px-4 py-3 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="gap-2 bg-black text-white cursor-pointer"
                  onClick={() => handleDownload(params.id as string, file.Key)}
                >
                  <Download size={16} />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-black text-red-500 cursor-pointer"
                  onClick={() => removeFile(params.id as string, file.Key)}
                >
                  <Delete size={16} />
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
