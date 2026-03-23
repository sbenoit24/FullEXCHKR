"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "@/services/auth/auth.service";
import DonationBanner from "./components/DonationBanner";
import ClubDonationModal from "./components/modals/ClubDonationModal";
import { AlertProvider } from "@/hooks/useAlert";

// Validation Schema
const donationSchema = z.object({
  donatorName: z
    .string()
    .trim() // Automatically removes leading/trailing spaces
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    // Ensure it starts with a letter and allows spaces in between, but not ONLY spaces
    .regex(
      /^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/,
      "Please enter a valid name (letters only)",
    ),
  donatorEmail: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase(),
  universityName: z.string().min(1, "Please select a university"),
  clubName: z.string().min(1, "Please select a club"),
  clubId: z
    .number()
    .or(z.string())
    .refine((val) => val, "Club ID is required"),
});

export default function ClubDonationPage() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donatorName: "",
      donatorEmail: "",
      universityName: "",
      clubName: "",
      clubId: null,
    },
  });

  // API data states
  const [universities, setUniversities] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isFetchingUniv, setIsFetchingUniv] = useState(false);
  const [isFetchingClubs, setIsFetchingClubs] = useState(false);

  // Dropdown visibility
  const [showUnivList, setShowUnivList] = useState(false);
  const [showClubList, setShowClubList] = useState(false);

  // Watch values
  const universityName = watch("universityName");
  const clubName = watch("clubName");

  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donatorData, setDonatorData] = useState(null);

  // Fetch Universities (memoized)
  useEffect(() => {
    let mounted = true;

    const fetchUniversities = async () => {
      setIsFetchingUniv(true);
      try {
        const response = await authService.getPlatformUniversities();
        if (mounted) {
          setUniversities(response.data || response || []);
        }
      } catch (err) {
        console.error("Error fetching universities:", err);
      } finally {
        if (mounted) setIsFetchingUniv(false);
      }
    };

    fetchUniversities();
    return () => (mounted = false);
  }, []);

  // Fetch Clubs when university changes
  const fetchClubsForUniversity = useCallback(async (univName) => {
    if (!univName) {
      setClubs([]);
      return;
    }

    setIsFetchingClubs(true);
    try {
      const response = await authService.getPlatformClubs(univName);
      setClubs(response.data || response || []);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setClubs([]);
    } finally {
      setIsFetchingClubs(false);
    }
  }, []);

  useEffect(() => {
    if (universityName) {
      fetchClubsForUniversity(universityName);
      // Reset club selection when university changes
      setValue("clubName", "");
      setValue("clubId", null);
    } else {
      setClubs([]);
    }
  }, [universityName, fetchClubsForUniversity, setValue]);

  // Filtered lists (memoized)
  const filteredUniversities = useMemo(
    () =>
      universities.filter((u) =>
        u.universityName.toLowerCase().includes(universityName.toLowerCase()),
      ),
    [universities, universityName],
  );

  const filteredClubs = useMemo(
    () =>
      clubs.filter((c) =>
        c.clubName.toLowerCase().includes(clubName.toLowerCase()),
      ),
    [clubs, clubName],
  );

  // Handlers
  const handleUniversitySelect = useCallback(
    (uName) => {
      setValue("universityName", uName, { shouldValidate: true });
      setShowUnivList(false);
    },
    [setValue],
  );

  const handleClubSelect = useCallback(
    (club) => {
      setValue("clubName", club.clubName, { shouldValidate: true });
      setValue("clubId", club.id, { shouldValidate: true });
      setShowClubList(false);
    },
    [setValue],
  );

  const onSubmit = async (data) => {
    try {
      setDonatorData(data);
      setIsDonationModalOpen(true);
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <AlertProvider>
      <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
        <DonationBanner />

        <div className="w-full md:w-7/12 flex items-center justify-center p-8 lg:p-24 bg-white border-l border-gray-100">
          <div className="w-full max-w-lg">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#122B5B] mb-2">
                Make a Donation
              </h2>
              <p className="text-gray-500">
                Support your favorite university organization today.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donator Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#0E2249]/60 ml-1">
                    Donator Name
                  </label>
                  <Controller
                    name="donatorName"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="Enter full name"
                        className={`w-full px-5 py-4 rounded-2xl bg-gray-50 text-slate-900 border ${
                          errors.donatorName
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-100 focus:border-[#C39A4E]"
                        } outline-none transition-colors`}
                      />
                    )}
                  />
                  {errors.donatorName && (
                    <p className="text-xs text-red-500 ml-1">
                      {errors.donatorName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#0E2249]/60 ml-1">
                    Email
                  </label>
                  <Controller
                    name="donatorEmail"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="email@example.com"
                        className={`w-full px-5 py-4 rounded-2xl bg-gray-50 text-slate-900 border ${
                          errors.donatorEmail
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-100 focus:border-[#C39A4E]"
                        } outline-none transition-colors`}
                      />
                    )}
                  />
                  {errors.donatorEmail && (
                    <p className="text-xs text-red-500 ml-1">
                      {errors.donatorEmail.message}
                    </p>
                  )}
                </div>
              </div>

              {/* University Searchable Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold uppercase text-[#0E2249]/60 ml-1">
                  University{" "}
                  {isFetchingUniv && (
                    <span className="lowercase font-normal animate-pulse">
                      (Loading...)
                    </span>
                  )}
                </label>
                <Controller
                  name="universityName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Search university name"
                      onFocus={() => setShowUnivList(true)}
                      onBlur={() =>
                        setTimeout(() => setShowUnivList(false), 200)
                      }
                      className={`w-full px-5 py-4 rounded-2xl bg-gray-50 text-slate-900 border ${
                        errors.universityName
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-100 focus:border-[#C39A4E]"
                      } outline-none transition-colors`}
                    />
                  )}
                />
                {showUnivList && filteredUniversities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filteredUniversities.map((u) => (
                      <div
                        key={u.id}
                        onMouseDown={() =>
                          handleUniversitySelect(u.universityName)
                        }
                        className="px-5 py-3 hover:bg-[#B8DFFF]/20 cursor-pointer text-[#0E2249] transition-colors"
                      >
                        {u.universityName}
                      </div>
                    ))}
                  </div>
                )}
                {errors.universityName && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.universityName.message}
                  </p>
                )}
              </div>

              {/* Club Searchable Dropdown */}
              <div
                className={`space-y-2 relative transition-opacity ${
                  !universityName ? "opacity-50" : "opacity-100"
                }`}
              >
                <label className="text-xs font-bold uppercase text-[#0E2249]/60 ml-1">
                  Target Club{" "}
                  {isFetchingClubs && (
                    <span className="lowercase font-normal animate-pulse">
                      (Fetching...)
                    </span>
                  )}
                </label>
                <Controller
                  name="clubName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled={!universityName || isFetchingClubs}
                      placeholder={
                        universityName
                          ? "Search for a club"
                          : "Select a university first"
                      }
                      onFocus={() => setShowClubList(true)}
                      onBlur={() =>
                        setTimeout(() => setShowClubList(false), 200)
                      }
                      className={`w-full px-5 py-4 rounded-2xl bg-gray-50 text-slate-900 border ${
                        errors.clubName
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-100 focus:border-[#C39A4E]"
                      } outline-none disabled:cursor-not-allowed transition-colors`}
                    />
                  )}
                />
                {showClubList && universityName && filteredClubs.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filteredClubs.map((c) => (
                      <div
                        key={c.id}
                        onMouseDown={() => handleClubSelect(c)}
                        className="px-5 py-3 hover:bg-[#B8DFFF]/20 cursor-pointer text-[#0E2249] transition-colors"
                      >
                        {c.clubName}
                      </div>
                    ))}
                  </div>
                )}
                {errors.clubName && (
                  <p className="text-xs text-red-500 ml-1">
                    {errors.clubName.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center bg-[#0E2249] text-white shadow-xl disabled:opacity-70 hover:bg-[#0E2249]/90 transition-all"
              >
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </form>
          </div>
        </div>

        <ClubDonationModal
          donatorData={donatorData}
          isOpen={isDonationModalOpen}
          onClose={() => setIsDonationModalOpen(false)}
        />
      </div>
    </AlertProvider>
  );
}
