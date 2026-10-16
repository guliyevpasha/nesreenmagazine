"use client";

/**
 * DateRangePicker — Tarix aralığı seçici (başlanğıc və son tarix).
 */

import { useState } from "react";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** Hazır presetlər göstər */
  showPresets?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  showPresets = true,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState(value.start);
  const [endDate, setEndDate] = useState(value.end);

  const handleApply = () => {
    onChange({ start: startDate, end: endDate });
  };

  const applyPreset = (preset: "today" | "week" | "month" | "year") => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    let start = today;
    const end = today;

    switch (preset) {
      case "today":
        start = today;
        break;
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        break;
      case "month":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        break;
      case "year":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        break;
    }

    setStartDate(start);
    setEndDate(end);
    onChange({ start, end });
  };

  return (
    <div className="border border-line bg-paper px-4 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block font-ui text-[10px] uppercase tracking-[0.12em] text-muted mb-1.5">
            Başlanğıc
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-line bg-paper px-3 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block font-ui text-[10px] uppercase tracking-[0.12em] text-muted mb-1.5">
            Son
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-line bg-paper px-3 py-2 font-ui text-[13px] text-ink focus:border-bordo focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="btn-primary px-6 py-2"
        >
          Tətbiq et
        </button>
      </div>

      {showPresets && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("today")}
            className="btn-secondary px-3 py-1 font-ui text-[11px]"
          >
            Bu gün
          </button>
          <button
            type="button"
            onClick={() => applyPreset("week")}
            className="btn-secondary px-3 py-1 font-ui text-[11px]"
          >
            Son 7 gün
          </button>
          <button
            type="button"
            onClick={() => applyPreset("month")}
            className="btn-secondary px-3 py-1 font-ui text-[11px]"
          >
            Son 30 gün
          </button>
          <button
            type="button"
            onClick={() => applyPreset("year")}
            className="btn-secondary px-3 py-1 font-ui text-[11px]"
          >
            Son 1 il
          </button>
        </div>
      )}
    </div>
  );
}
