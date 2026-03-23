"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import icon from "@/assets/images/icon.png";

export default function SelectRolePage() {
  const router = useRouter();

  const handleSelect = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div
        className="w-full max-w-md bg-white rounded-2xl p-6"
        style={{
          boxShadow:
            "0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <Image src={icon} alt="App Icon" width={64} height={64} priority />
        </div>

        {/* Title */}
        <h1 className="text-[#122B5B] text-[24px] leading-8 font-bold text-center mb-2">
          Welcome to EXCHKR
        </h1>

        {/* Subtitle */}
        <p className="text-[#122B5B70] text-[16px] leading-6 font-normal text-center mb-6">
          Select your role to continue
        </p>

        <div className="space-y-4">
          {/* Club Officer */}
          <button
            onClick={() => handleSelect("/club-officer")}
            className="w-full h-[65px] rounded-xl bg-[#122B5B] hover:opacity-90 transition flex flex-col items-center justify-center"
          >
            <span className="text-white text-[16px] font-bold">
              Club Officer
            </span>
            <span className="text-white text-[12px] leading-4 font-normal">
              Manage finance and members
            </span>
          </button>

          {/* Club Member */}
          <button
            onClick={() => handleSelect("/club-member")}
            className="w-full h-[65px] rounded-xl bg-white border-2 border-[#122B5B] hover:bg-[#F9FAFB] transition flex flex-col items-center justify-center"
          >
            <span className="text-[#122B5B] text-[16px] font-bold">
              Club Member
            </span>
            <span className="text-[#122B5B] text-[12px] leading-4 font-normal">
              View events & connect with members
            </span>
          </button>
        </div>

        {/* footer */}
        <p className="text-[#122B5B70] text-[12px] font-normal text-center mt-4">
          You can always switch roles from your profile
        </p>
      </div>
    </div>
  );
}
