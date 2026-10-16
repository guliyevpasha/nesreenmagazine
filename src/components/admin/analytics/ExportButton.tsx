/**
 * ExportButton - CSV və JSON export düyməsi
 */

"use client";

import { useState } from "react";

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  label?: string;
}

export function ExportButton({
  onExportCSV,
  onExportJSON,
  label = "Eksport",
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-line bg-paper px-4 py-2 font-ui text-[12px] uppercase tracking-[0.12em] text-ink hover:border-bordo hover:text-bordo transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {label}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-40 border border-line bg-paper shadow-lg">
            <button
              type="button"
              onClick={() => {
                onExportCSV();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left font-ui text-[13px] text-ink hover:bg-cream-deep transition-colors"
            >
              CSV fayl
            </button>
            <button
              type="button"
              onClick={() => {
                onExportJSON();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left font-ui text-[13px] text-ink hover:bg-cream-deep transition-colors"
            >
              JSON fayl
            </button>
          </div>
        </>
      )}
    </div>
  );
}
