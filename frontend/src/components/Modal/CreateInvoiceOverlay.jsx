import { useState } from "react";
import { X, FileText, Calendar, Plus, Send, Trash2 } from "lucide-react";

export default function CreateInvoiceOverlay({ onClose, members, onSend }) {
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "", amount: "0.00" },
  ]);
  const [dueDate, setDueDate] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [errors, setErrors] = useState({});

  // Fee percentages from environment variables
  // Percentages (convert to decimals once)
  const PLATFORM_FEE_PERCENTAGE =
    Number(process.env.REACT_APP_PLATFORM_FEE_PERCENTAGE || "1") / 100;

  const STRIPE_FEE_CARD_PERCENTAGE =
    Number(process.env.REACT_APP_STRIPE_FEE_CARD_PERCENTAGE || "2.9") / 100;

  const STRIPE_FEE_CARD_FIXED =
    Number(process.env.REACT_APP_STRIPE_FEE_CARD_FIXED || "30") / 100;

  const validateForm = () => {
    const newErrors = {};

    if (!invoiceTitle.trim()) {
      newErrors.invoiceTitle = "Invoice title is required";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (lineItems.length === 0) {
      newErrors.lineItems = "At least one line item is required";
    } else {
      const lineItemErrors = lineItems.map((item) => {
        const itemErrors = {};

        if (!item.description.trim()) {
          itemErrors.description = "Description required";
        }

        if (!item.amount || parseFloat(item.amount) <= 0) {
          itemErrors.amount = "Amount must be greater than 0";
        }

        return itemErrors;
      });

      if (lineItemErrors.some((e) => Object.keys(e).length > 0)) {
        newErrors.lineItems = lineItemErrors;
      }
    }

    if (selectedMembers.length === 0) {
      newErrors.recipients = "Select at least one member";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: "0.00" }]);
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  };

  const removeLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const selectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((m) => m.userId));
    }
  };

  const calculateLineItemsTotal = () => {
    return lineItems.reduce(
      (sum, item) => sum + parseFloat(item.amount || 0),
      0,
    );
  };

  const calculatePlatformFee = () => {
    const total = calculateTotalToCharge();
    return Number((total * PLATFORM_FEE_PERCENTAGE).toFixed(2));
  };

  const calculateStripeFee = () => {
    const total = calculateTotalToCharge();

    return Number(
      (total * STRIPE_FEE_CARD_PERCENTAGE + STRIPE_FEE_CARD_FIXED).toFixed(2),
    );
  };

  const calculateTotalToCharge = () => {
    const netAmount = calculateLineItemsTotal();

    if (netAmount <= 0) return 0;

    const totalPercentage =
      STRIPE_FEE_CARD_PERCENTAGE + PLATFORM_FEE_PERCENTAGE;

    const totalToCharge =
      (netAmount + STRIPE_FEE_CARD_FIXED) / (1 - totalPercentage);

    return Number(totalToCharge.toFixed(2));
  };

  const calculateTotal = () => {
    return calculateTotalToCharge().toFixed(2);
  };

  const handleSend = () => {
    if (!validateForm()) return;

    const invoiceData = {
      invoiceTitle: invoiceTitle.trim(),
      lineItems: lineItems.map((item) => ({
        description: item.description.trim(),
        amount: parseFloat(item.amount) || 0,
      })),
      totalAmount: parseFloat(calculateTotal()),
      dueDate: dueDate.trim(),
      additionalNotes: additionalNotes.trim(),
      selectedMemberIds: [...selectedMembers],
    };

    onSend(invoiceData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-6 h-6 text-gray-700" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Create Invoice
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Send payment requests to members for events, merchandise, or
                other charges
              </p>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Invoice Title */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Invoice Title *
            </label>
            <input
              type="text"
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              placeholder="e.g., Spring Formal Ticket, Club Merchandise"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.invoiceTitle && (
              <p className="text-sm text-red-600 mt-1">{errors.invoiceTitle}</p>
            )}
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-800">
                Line Items *
              </label>
              <button
                onClick={addLineItem}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {lineItems.map((item, index) => (
              <div key={index} className="mb-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, "description", e.target.value)
                    }
                    placeholder="Description"
                    className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg w-32">
                    <span className="text-gray-600 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={item.amount}
                      onChange={(e) =>
                        updateLineItem(index, "amount", e.target.value)
                      }
                      onWheel={(e) => e.target.blur()}
                      className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Line item errors */}
                {errors.lineItems?.[index]?.description && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.lineItems[index].description}
                  </p>
                )}

                {errors.lineItems?.[index]?.amount && (
                  <p className="text-xs text-red-600">
                    {errors.lineItems[index].amount}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Total Amount with Fees Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal (Line Items)</span>
              <span className="text-gray-800 font-medium">
                ${calculateLineItemsTotal().toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Platform Fee ({(PLATFORM_FEE_PERCENTAGE * 100).toFixed(0)}%)
              </span>
              <span className="text-gray-800">
                ${calculatePlatformFee().toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Stripe Fee ({(STRIPE_FEE_CARD_PERCENTAGE * 100).toFixed(1)}% + $
                {STRIPE_FEE_CARD_FIXED.toFixed(2)})
              </span>
              <span className="text-gray-800">
                ${calculateStripeFee().toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-800">
                  Total Amount
                </span>
                <span className="text-3xl font-semibold text-gray-800">
                  ${calculateTotal()}
                </span>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Due Date *
            </label>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

              <input
                type="date"
                value={dueDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Add any additional information or payment instructions..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Send To */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-800">
                Send To *
              </label>
              <button
                onClick={selectAll}
                className="text-sm font-medium text-black-600 hover:text-black-700"
              >
                Select All
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
              {members.map((member) => (
                <label
                  key={member?.userId}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member?.userId)}
                    onChange={() => toggleMember(member?.userId)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {`${member?.firstName} ${member?.lastName != null && member?.lastName.length > 1 ? member?.lastName : ""}`}
                    </div>
                    <div className="text-sm text-gray-600">{member?.email}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.recipients && (
              <p className="text-sm text-red-600 mt-2">{errors.recipients}</p>
            )}
          </div>

          {/* Invoice Preview */}
          <div className="border-2 border-gray-900 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-semibold text-gray-800">
                Invoice Preview
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="text-gray-800">{invoiceTitle || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800">
                  ${calculateLineItemsTotal().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fees:</span>
                <span className="text-gray-800">
                  ${(calculatePlatformFee() + calculateStripeFee()).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-gray-800 font-semibold">
                  ${calculateTotal()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="text-gray-800">{dueDate || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Recipients:</span>
                <span className="text-gray-800 font-semibold">
                  {selectedMembers.length} members
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white">
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleSend}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#122B5B] text-white text-sm font-semibold rounded-lg hover:bg-[#122B5B]"
            >
              <Send className="w-5 h-5" />
              Send {selectedMembers.length} Invoices
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-center text-gray-600">
            Members will receive an email with a secure payment link powered by
            Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
