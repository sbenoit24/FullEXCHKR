"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import icon from "@/assets/images/EXCHKR Golden Bull.png";
import { authService } from "@/services/auth/auth.service";
import MessageButtonModal from "@/components/Modal/MessageButtonModal";

export default function ClubCreationPage() {
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    // Group the data into a payload object for the console
    const payload = {
      clubName,
      fullName,
      email,
      schoolName,
    };

    try {
      // Passing the data to the service
      await authService.createClub(payload);

      setModalType("success");
      setModalMessage("Club is created, please go to login.");
      setModalOpen(true);
    } catch (error) {
      console.error("Club creation failed:", error);

      setModalType("error");
      setModalMessage("Oops, something went wrong. Please try again.");
      setModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOk = () => {
    if (modalType === "success") {
      router.push("/login");
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#0E2249]">
        <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#122B5B] px-4 sm:px-6 py-4 sm:py-5 flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0">
              <Image
                src={icon}
                alt="App Icon"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1
              className="text-2xl sm:text-[30px] leading-8 sm:leading-9 font-bold text-[#C39A4E] text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              EXCHKR
            </h1>

            <p className="text-base sm:text-[18px] leading-6 sm:leading-7 font-normal text-[#B8DFFF] text-center">
              Create Your Club
            </p>
          </div>

          {/* Body */}
          <div className="bg-[#FFFFFFE5] p-5 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* School Name Field */}
              <div>
                <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
                  University or School
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name"
                  className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                             bg-[#122B5B08] border border-transparent
                             text-xs sm:text-[14px] leading-5 text-[#122B5B]
                             placeholder:text-[#122B5B99]
                             focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                             transition-all"
                />
              </div>

              {/* Club Name */}
              <div>
                <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
                  Club Name
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  placeholder="Enter club name"
                  className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                             bg-[#122B5B08] border border-transparent
                             text-xs sm:text-[14px] leading-5 text-[#122B5B]
                             placeholder:text-[#122B5B99]
                             focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                             transition-all"
                />
              </div>

              {/* Officer Full Name */}
              <div>
                <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
                  Officer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter officer full name"
                  className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                             bg-[#122B5B08] border border-transparent
                             text-xs sm:text-[14px] leading-5 text-[#122B5B]
                             placeholder:text-[#122B5B99]
                             focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                             transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 text-xs sm:text-[14px] font-normal text-[#122B5B]">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full h-8 sm:h-9 rounded-[14px] px-3 sm:px-4
                             bg-[#122B5B08] border border-transparent
                             text-xs sm:text-[14px] leading-5 text-[#122B5B]
                             placeholder:text-[#122B5B99]
                             focus:outline-none focus:ring-2 focus:ring-[#122B5B]
                             transition-all"
                />
              </div>

              {/* Register Button */}
              <div className="mt-5 sm:mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 sm:h-10 rounded-[14px]
                             bg-[#122B5B] text-white
                             text-xs sm:text-[14px] font-normal leading-5
                             flex items-center justify-center gap-2
                             transition-all
                             disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Register Club
                  {isLoading && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <MessageButtonModal
        isOpen={modalOpen}
        type={modalType}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onOk={handleModalOk}
      />
    </>
  );
}
