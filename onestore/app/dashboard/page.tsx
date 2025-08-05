import { BucketTable } from "@/components/customComponents/BucketTable";
import { CreateBucket } from "@/components/customComponents/CreateBucketDialog";
import { Button } from "@/components/ui/button";
import { listBuckets } from "@/serverActions/s3Actions";
import React from "react";

const page = async () => {
  const res = await listBuckets();
  return (
    <div className="bg-black min-h-svh flex flex-col">
      <p className="text-center m-2 text-white text-5xl tracking-wider font-bold">
        BUCKETS
      </p>
      {/* <Button className="w-20 ml-5 font-bold bg-orange-500 hover:bg-orange-500 cursor-pointer">
        Create
      </Button> */}
      <CreateBucket />
      <BucketTable data={res?.buckets} />
    </div>
  );
};

export default page;
