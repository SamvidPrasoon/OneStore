import { LoginForm } from "@/components/login-form";
import { Boxes } from "lucide-react";
import React from "react";

const page = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-6 md:p-10 bg-black overflow-hidden">
      <p className="text-white font-bold text-7xl text-center tracking-widest">
        Welcome To OneStor3
      </p>
      <p className="text-orange-500 font-bold text-2xl flex flex-row items-center justify-center tracking-wide">
        Connect to AWS S3{" "}
        <span className="ml-2 mr-2">
          <Boxes />
        </span>{" "}
        at your ease
      </p>
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
};

export default page;
