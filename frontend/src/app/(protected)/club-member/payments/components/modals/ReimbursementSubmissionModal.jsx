"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal/Modal.js";
import {
  X,
  Upload,
  Camera,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { memberService } from "@/services/member/member.service";
import { useAlert } from "@/hooks/useAlert";

export default function ReimbursementSubmissionModal({
  memberData,
  isOpen,
  onClose,
}) {
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const showAlert = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    receiptImage: null,
    amount: "",
    date: "",
    category: "",
    description: "",
  });

  const fetchClubBudgetCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await memberService.getClubBudgetCategories();
      const categoriesArray = response.categories || [];
      setCategories(categoriesArray);
    } catch (err) {
      setCategories([]);
      console.error("Error fetching categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchClubBudgetCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trimStart() }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 3 * 1024 * 1024; // 3MB

    if (!validTypes.includes(file.type)) {
      modalRef.current?.addAlert("Only JPG, JPEG, or PNG images are allowed!");
      return;
    }

    if (file.size > maxSize) {
      modalRef.current?.addAlert("File size should not exceed 5MB.");

      return;
    }

    setFormData((prev) => ({ ...prev, receiptImage: file }));
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, receiptImage: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset input so same file can be selected again
    }
  };

  // Format file size helper
  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes >= 1024 * 1024)
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    if (sizeInBytes >= 1024) return (sizeInBytes / 1024).toFixed(1) + " KB";
    return sizeInBytes + " B";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // extra safety

    if (
      !formData.receiptImage ||
      !formData.amount ||
      !formData.date ||
      !formData.category
    ) {
      modalRef.current?.addAlert("Please fill in all required fields.");
      return;
    }

    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      modalRef.current?.addAlert("Amount must be greater than 0.");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("userId", memberData?.userId);
      data.append("clubId", memberData?.clubId);
      data.append("amount", formData.amount);
      data.append("category", formData.category);
      data.append("description", formData.description || "");
      data.append("purchaseDate", formData.date);
      data.append("receiptImageFile", formData.receiptImage);

      const response = await memberService.memberReimbursementRequest(data);

      if (response.status === 200) {
        showAlert("Reimbursement submitted successfully!", "success");
        onClose();
      } else {
        modalRef.current?.addAlert(
          response.data?.message || "Failed to submit reimbursement.",
        );
      }
    } catch (err) {
      modalRef.current?.addAlert(
        err?.response?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      isOpen={isOpen}
      onClose={!isLoading ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-[520px] max-h-[90vh] bg-white rounded-3xl shadow-xl overflow-y-auto 
        [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Close Button */}
        <button
          onClick={!isLoading ? onClose : undefined}
          className={`absolute top-5 right-5 p-2 rounded-full transition z-10 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          <X size={20} className="text-gray-400" />
        </button>

        {/* Header */}
        <div className="px-6 pt-8 flex justify-between items-start">
          <div>
            <h2 className="text-[#1E3A5F] font-bold text-xl">Submit Receipt</h2>
            <p className="text-gray-400 text-sm">
              Upload a receipt for reimbursement
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Receipt Image Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1E3A5F]">
              Receipt Image *
            </label>

            {!formData.receiptImage ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#1E3A5F] rounded-2xl p-4 bg-blue-50/30 hover:bg-blue-50 transition gap-2"
                >
                  <Upload size={24} className="text-[#1E3A5F]" />
                  <span className="text-[#1E3A5F] font-semibold text-sm">
                    Upload File
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    Choose from device
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition gap-2 text-gray-400"
                >
                  <Camera size={24} />
                  <span className="font-semibold text-sm">Take Photo</span>
                  <span className="text-[10px]">Use camera</span>
                </button>
              </div>
            ) : (
              <div className="relative flex items-center bg-green-50/50 border border-green-200 rounded-2xl p-4 gap-4">
                <div className="shrink-0 bg-green-600 rounded-full p-2 flex items-center justify-center">
                  <CheckCircle
                    size={24}
                    className="text-white"
                    strokeWidth={3}
                  />
                </div>

                <div className="flex flex-col grow min-w-0">
                  <span className="text-[#004a77] font-semibold truncate text-[15px]">
                    {formData.receiptImage.name}
                  </span>
                  <span className="text-gray-400 text-[13px]">
                    {formatFileSize(formData.receiptImage.size)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors ml-2"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Amount Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1E3A5F]">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                min="0.01"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 bg-[#F8FAFC] text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Date Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1E3A5F]">
              Date of Purchase *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-600"
            />
          </div>

          {/* Category Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1E3A5F]">
              Category *
            </label>

            {categoriesLoading ? (
              /* Skeleton Loading State */
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[42px] w-full bg-gray-200 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : categories.length > 0 ? (
              /* Loaded State */
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        category: cat.categoryName,
                      }))
                    }
                    className={`py-2.5 px-3 rounded-xl border text-sm transition font-medium ${
                      formData.category === cat.categoryName
                        ? "bg-[#122B5B] border-[#1E3A5F] text-[#FFFFFF]"
                        : "bg-white border-gray-200 text-[#122B5B] hover:border-gray-300"
                    }`}
                  >
                    {cat.categoryName}
                  </button>
                ))}
              </div>
            ) : (
              /* Empty State Message */
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50">
                <p className="text-sm text-amber-800 leading-relaxed">
                  The club has not created any <strong>Budgets</strong> for
                  categories yet. Please contact your club officer for
                  assistance.
                </p>
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#1E3A5F]">
              Description *
            </label>
            <textarea
              name="description"
              placeholder="What was this purchase for?"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#F8FAFC] text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Policy Box */}
          <div className="bg-[#EFF6FF] rounded-2xl p-4 flex gap-3 border border-blue-100">
            <FileText className="text-[#1E3A5F] shrink-0" size={20} />
            <div className="text-[12px] text-[#1E3A5F]">
              <p className="font-bold mb-1">Reimbursement Policy</p>
              <ul className="list-disc ml-4 space-y-0.5 opacity-80">
                <li>Receipts must be submitted within 30 days</li>
                <li>Pre-approved purchases only</li>
                <li>Processing takes 5-7 business days</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8A9AB0] hover:bg-[#74869D] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Upload size={18} />
            )}
            Submit for Approval
          </button>
        </form>
      </div>
    </Modal>
  );
}
