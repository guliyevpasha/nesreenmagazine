/**
 * Quick Create Modal - NewsPilot style
 * Fast access to create new content
 */
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickCreateModal({ isOpen, onClose }: QuickCreateModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
        </svg>
      ),
      title: "Yeni Məqalə",
      description: "Yeni jurnal məqaləsi yaz və dərc et",
      href: "/admin/articles/new",
      color: "from-bordo to-bordo-soft",
      bgColor: "bg-bordo-50",
      textColor: "text-bordo",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
        </svg>
      ),
      title: "Qaralama",
      description: "Məqaləni qaralama olaraq saxla",
      href: "/admin/articles/new?status=draft",
      color: "from-gold to-gold-soft",
      bgColor: "bg-gold-50",
      textColor: "text-gold",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
        </svg>
      ),
      title: "Media Yüklə",
      description: "Media kitabxanasına şəkil əlavə et",
      href: "/admin/media",
      color: "from-cream to-slate-200",
      bgColor: "bg-cream",
      textColor: "text-bordo-deep",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Yeni Müştəri",
      description: "CRM sisteminə müştəri əlavə et",
      href: "/admin/crm",
      color: "from-bordo-soft to-bordo",
      bgColor: "bg-bordo-50",
      textColor: "text-bordo-deep",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      ),
      title: "Reklam Sifarişi",
      description: "Yeni reklam sifarişi yarat",
      href: "/admin/ad-orders",
      color: "from-gold-soft to-gold",
      bgColor: "bg-gold-50",
      textColor: "text-gold",
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ),
      title: "Kontent Tapşırığı",
      description: "Kontent planına tapşırıq əlavə et",
      href: "/admin/content-plan",
      color: "from-gold to-bordo-soft",
      bgColor: "bg-cream",
      textColor: "text-bordo",
    },
  ];

  const handleItemClick = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 pointer-events-none overflow-y-auto">
        <div
          className="pointer-events-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 animate-fade-in my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-slate-200 bg-gradient-to-r from-bordo via-bordo-deep to-bordo-soft px-4 py-3 sm:px-6 sm:py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">Tez Yarat</h2>
                <p className="mt-1 font-ui text-[11px] sm:text-[12px] text-cream">
                  Yaratmaq istədiyinizi seçin
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-all hover:bg-white/20 hover:scale-110 active:scale-100"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="grid gap-3 p-4 sm:p-6 sm:grid-cols-2">
            {items.map((item) => (
              <button
                key={item.title}
                onClick={() => handleItemClick(item.href)}
                className="group flex items-start gap-3 sm:gap-4 rounded-lg border border-slate-200 bg-white p-3 sm:p-4 text-left transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
              >
                <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-ui text-[13px] sm:text-[14px] font-bold ${item.textColor}`}>
                    {item.title}
                  </h3>
                  <p className="mt-1 font-ui text-[11px] sm:text-[12px] text-slate-600 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 rounded-b-xl">
            <p className="text-center font-ui text-[10px] sm:text-[11px] text-slate-500">
              Bağlamaq üçün <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-sm border border-slate-200">ESC</kbd> basın
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
