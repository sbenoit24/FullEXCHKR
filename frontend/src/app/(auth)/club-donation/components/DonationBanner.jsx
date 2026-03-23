import Image from "next/image";
import icon from "@/assets/images/EXCHKR Golden Bull.png";

export default function DonationBanner() {
  return (
    <div className="w-full md:w-5/12 bg-[#0E2249] flex items-center justify-center p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-[#C39A4E] opacity-10 blur-3xl"></div>
      <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
        <div className="mb-8">
          <Image
            src={icon}
            alt="Logo"
            width={70}
            height={70}
            className="object-contain"
            priority
          />
        </div>
        <h1 className="text-5xl font-black text-[#C39A4E] tracking-tighter mb-4">
          EXCHKR
        </h1>
        <p className="text-[#FFFFFF] text-lg font-medium tracking-widest uppercase mb-6">
          Donation Portal
        </p>
        <p className="text-[#B8DFFF] max-w-sm leading-relaxed font-light">
          Fueling student innovation. Your support helps university clubs reach
          their next milestone.
        </p>
      </div>
    </div>
  );
}
