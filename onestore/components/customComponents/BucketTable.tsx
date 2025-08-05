"use client";

import Link from "next/link";
import { deleteBucket } from "@/serverActions/s3Actions";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function BucketTable({ data }: { data: any }) {
  const removeBucket = async (bucketName: string) => {
    const res = await deleteBucket(bucketName);
    if (res.success) {
      toast.success("Successfully deleted bucket");
    } else {
      toast.error(res.error);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-xl sm:text-2xl text-gray-400 font-medium py-6">
        No Buckets Found
      </div>
    );
  }

  return (

        <div className="overflow-x-auto m-5">
          <table className="min-w-[600px] w-full text-left text-sm bg-black text-white">
            <thead className="bg-gray-800 uppercase text-xs font-bold tracking-wide">
              <tr>
                <th className="p-3 w-1/3">Bucket</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr
                  key={`${item.Name}-${item.CreationDate}`}
                  className="border-b border-gray-700 hover:bg-gray-900 transition"
                >
                  <td className="p-3 break-words font-semibold">{item.Name}</td>
                  <td className="p-3 text-gray-300">
                    {new Date(item.CreationDate).toISOString()}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap space-x-2">
                    <Link href={`/bucket/${item.Name}`}>
                      <Button className="px-3 py-1 text-xs border border-gray-500 rounded-md hover:bg-gray-700 font-bold">
                        View
                      </Button>
                    </Link>
                    <Button
                      className="px-3 py-1 text-xs text-red-500 border  rounded-md hover:bg-white hover:text-black font-bold"
                      onClick={() => removeBucket(item.Name)}
                    >
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
