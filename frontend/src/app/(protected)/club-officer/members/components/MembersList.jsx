"use client";
import { useEffect, useState } from "react";
import { Search, Import } from "lucide-react";
import { useMembersDashboardStore } from "@/stores/officer/membersDashboardStore";
import { officerService } from "@/services/officer/officer.service";
import UploadCSVModal from "./modals/UploadCSVModal";
import { formatToReadableDate } from "@/utils/date";

export default function MembersList() {
  const [search, setSearch] = useState("");
  const { membersData, loading, error, setMembers, setLoading, setError } =
    useMembersDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await officerService.fetchMembers();
      setMembers(data || []); // <- fallback to empty array
      setError(null);
    } catch (error) {
      console.log("Member fetching failed:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const tableData = membersData.filter((member) =>
    Object.values(member)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4">
        {/* Top section */}
        <div className="flex items-start justify-between mb-6">
          {/* Left */}
          <div>
            <h3 className="text-[16px] leading-4 font-normal text-[#122B5B]">
              Member List
            </h3>
            <p className="mt-1 text-[16px] leading-6 font-normal text-[#122B5B70]">
              Manage your organization members
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex items-center bg-[#122B5B08] rounded-md px-3 h-9">
              <Search size={16} className="text-[#122B5B]" />
              <input
                type="text"
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ml-2 bg-transparent outline-none text-[14px] text-[#122B5B] placeholder-[#122B5B70]"
              />
            </div>

            {/* Import */}
            <button
              className="flex items-center gap-2 h-9 px-3 border border-[#122B5B] rounded-md text-[#122B5B] text-[14px] font-normal"
              onClick={() => setIsModalOpen(true)}
            >
              <Import size={16} />
              Import CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-[#122B5B70]">
              Loading members...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">Error: {error}</div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8 text-[#122B5B70]">
              No members found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  {/* Added min-width and padding to Name */}
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B] min-w-[200px] w-1/4">
                    Name
                  </th>
                  {/* Added min-width and padding to Email */}
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B] min-w-[250px] w-1/4">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B]">
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B]">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B]">
                    Joining Date
                  </th>
                  <th className="px-4 py-2 text-left text-[14px] font-semibold text-[#122B5B]">
                    Actions
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {tableData.map((member) => (
                  <tr key={member.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-[14px] text-[#122B5B]  font-medium">
                      {member?.firstName} {member?.lastName}
                    </td>

                    <td className="px-4 py-3 text-[14px] text-[#122B5B] break-all">
                      {member.email}
                    </td>

                    <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                      {member.roles && member.roles.length > 0
                        ? member.roles[0]
                        : "Unknown"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-normal ${
                          member.status === "Active"
                            ? "bg-[#DCFCE7] text-[#016630]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[14px] text-[#122B5B]">
                      {formatToReadableDate(member?.clubJoinedOn)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <button className="text-[14px] text-[#122B5B] font-semibold hover:underline">
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <UploadCSVModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
