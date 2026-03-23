'use client';

import React, { useState, useEffect } from 'react';

export default function AddBudgetCategoryModal({ isOpen, onClose, onSave }) {
  const [categoryName, setCategoryName] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    if (categoryName.trim()) {
      // Split by comma and filter out empty strings
      const categories = categoryName
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);
      
      if (categories.length > 0) {
        onSave(categories);
        setCategoryName('');
        onClose();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all">
        {/* Header with Gradient */}
        <div className="relative px-6 py-4 bg-[#122B5B]">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">
                Add Budget Categories
              </h2>
              <p className="text-blue-100 text-xs">
                Enter category names separated by commas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 overflow-y-auto flex-1 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#122B5B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category Names (separate with commas)
              </label>
              <div className="relative group">
                <input
                  id="categoryName"
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 placeholder:text-gray-400 hover:border-gray-300"
                  placeholder="e.g., Groceries, Transportation, Entertainment"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  autoFocus
                />
              </div>
              {/* <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Example: Groceries, Transportation, Entertainment
              </p> */}
            </div>

            {/* Preview of categories if user has typed something */}
            {categoryName.trim() && (
              <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-100 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview ({categoryName.split(',').filter(cat => cat.trim()).length} {categoryName.split(',').filter(cat => cat.trim()).length === 1 ? 'category' : 'categories'})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryName.split(',').map((cat, index) => {
                    const trimmedCat = cat.trim();
                    if (!trimmedCat) return null;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/70 text-gray-700 rounded-lg text-xs font-medium border border-blue-200 shadow-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {trimmedCat}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border-2 border-gray-300 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!categoryName.trim()}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                  categoryName.trim()
                    ? 'bg-[#122B5B] text-white hover:bg-[#1a3f7a] shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Categories
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}