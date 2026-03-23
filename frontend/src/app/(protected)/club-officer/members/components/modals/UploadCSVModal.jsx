"use client";

import { useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import { X, Loader2, Upload, FileText, Trash2 } from "lucide-react";
import { officerService } from "@/services/officer/officer.service";
import { useAlert } from "@/hooks/useAlert";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function UploadCSVModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const showAlert = useAlert();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv") {
      modalRef.current?.addAlert("Please upload a valid CSV file");
      e.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      modalRef.current?.addAlert("File size must be less than or equal to 5MB");
      e.target.value = "";
      return;
    }

    // Validate CSV headers
    try {
      const isValid = await validateCSVHeaders(selectedFile);
      if (!isValid) {
        modalRef.current?.addAlert(
          "CSV must contain 'Full Name' and 'Email' columns",
        );
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    } catch (error) {
      modalRef.current?.addAlert("Failed to read CSV file");
      e.target.value = "";
    }
  };

  const validateCSVHeaders = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const firstLine = text.split("\n")[0];
          const headers = firstLine
            .split(",")
            .map((h) => h.trim().replace(/"/g, ""));

          // Check if both required headers exist (case-insensitive)
          const hasFullName = headers.some(
            (h) => h.toLowerCase() === "full name",
          );
          const hasEmail = headers.some((h) => h.toLowerCase() === "email");

          resolve(hasFullName && hasEmail);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (loading) return; // extra protection
    if (!file) {
      modalRef.current?.addAlert("Please select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("membersCsvFile", file);

    try {
      setLoading(true);
      const response = await officerService.addMembersCSV(formData);

      if (response?.status === 200) {
        modalRef.current?.addAlert("CSV uploaded and processed successfully");
        handleClose();
        showAlert("Member addition initiated", "success");
      } else {
        showAlert("Something went wrong. Please try again later.", "warning");
      }
    } catch (error) {
      modalRef.current?.addAlert(
        error?.response?.data?.message ||
          "Failed to upload CSV. Check file format.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal ref={modalRef} isOpen={isOpen} onClose={handleClose}>
      {/* max-w-xl (576px) is a comfortable middle ground between your original and the huge version */}
      <div className="max-w-xl w-full bg-white rounded-2xl border border-[#E5E7EB] shadow-lg p-[35px] flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h2 className="text-[#122B5B] font-bold text-[20px]">Upload CSV</h2>
            <p className="text-[#122B5B70] text-[15px] mt-1">
              Bulk add members by uploading a .csv file
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Upload Area */}
        <div className="flex flex-col gap-4">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#122B5B20] bg-[#122B5B08] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-[#122B5B12] transition-colors"
            >
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Upload size={26} className="text-[#122B5B]" />
              </div>
              <div className="text-center">
                <p className="text-[#122B5B] font-medium text-[15px]">
                  Click to upload or drag and drop
                </p>
                <p className="text-[#122B5B70] text-[13px]">
                  CSV files only (max. 1MB)
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-5 bg-[#122B5B08] border border-[#122B5B10] rounded-2xl">
              <div className="flex items-center gap-4">
                <FileText className="text-[#122B5B]" size={28} />
                <div className="flex flex-col">
                  <span className="text-[#122B5B] text-[15px] font-medium truncate max-w-[250px]">
                    {file.name}
                  </span>
                  <span className="text-[#122B5B70] text-[13px]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-[#122B5B15]">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <FileText size={19} className="text-[#122B5B]" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[#122B5B] font-semibold text-[14px]">
                  Add Members
                </p>
                <p className="text-[#122B5B80] text-[13px] leading-relaxed">
                  You can quickly add multiple members at once by uploading a
                  CSV file. Please ensure your file includes columns titled{" "}
                  <strong>Full Name</strong> and <strong>Email</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="bg-[#122B5B] text-white px-5 py-3 rounded-[14px] w-3/4 text-[15px] font-medium cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Uploading..." : "Upload Members"}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="bg-white text-[#122B5B] px-5 py-3 rounded-[14px] w-1/4 border border-[#122B5B20] text-[15px] font-medium cursor-pointer hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
