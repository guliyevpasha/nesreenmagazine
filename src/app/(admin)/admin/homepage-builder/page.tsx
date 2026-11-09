"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Panel, Alert, Button, LocaleTabs } from "@/components/admin/ui";
import type { Locale, HomepageSectionId } from "@/lib/types";
import { homepageSectionLabels } from "@/lib/types";

/**
 * Ana səhifə redaksiya idarəetməsi — yönləndirmə səhifəsi
 */
export default function HomepageBuilderPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("az");

  const sections: Array<{
    id: HomepageSectionId;
    label: string;
    description: string;
    icon: string;
  }> = [
    {
      id: "weekly-main-topic",
      label: "Bu həftənin baş mövzusu",
      description: "Ana səhifənin ən üst hissəsində göstərilən 20 məqalə",
      icon: "⭐",
    },
    {
      id: "latest-articles",
      label: "Ən son",
      description: "Yeni məqalələr bölməsi — 20 idarə, 15 göstərilir",
      icon: "🆕",
    },
    {
      id: "moda-editorial",
      label: "Moda — Redaksiya yazıları",
      description: "Sol tərəf — 20 idarə, 9 göstərilir",
      icon: "👗",
    },
    {
      id: "moda-most-read",
      label: "Moda — Ən çox oxunanlar",
      description: "Sağ tərəf — 20 idarə, 7 göstərilir",
      icon: "📊",
    },
    {
      id: "gozellik-editorial",
      label: "Gözəllik — Redaksiya yazıları",
      description: "Sol tərəf — 20 idarə, 9 göstərilir",
      icon: "💄",
    },
    {
      id: "gozellik-most-read",
      label: "Gözəllik — Ən çox oxunanlar",
      description: "Sağ tərəf — 20 idarə, 7 göstərilir",
      icon: "📊",
    },
    {
      id: "heyat-terzi-editorial",
      label: "Həyat tərzi — Redaksiya yazıları",
      description: "Sol tərəf — 20 idarə, 9 göstərilir",
      icon: "🌟",
    },
    {
      id: "heyat-terzi-most-read",
      label: "Həyat tərzi — Ən çox oxunanlar",
      description: "Sağ tərəf — 20 idarə, 7 göstərilir",
      icon: "📊",
    },
    {
      id: "biznes-editorial",
      label: "Biznes — Redaksiya yazıları",
      description: "Sol tərəf — 20 idarə, 9 göstərilir",
      icon: "💼",
    },
    {
      id: "biznes-most-read",
      label: "Biznes — Ən çox oxunanlar",
      description: "Sağ tərəf — 20 idarə, 7 göstərilir",
      icon: "📊",
    },
  ];

  const handleNavigate = (sectionId: HomepageSectionId) => {
    router.push(`/admin/homepage-builder/${sectionId}?locale=${locale}`);
  };

  return (
    <>
      <PageHeader
        title="Ana Səhifə Redaksiya İdarəetməsi"
        description="Ana səhifədə göstəriləcək məqalələri idarə edin"
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        <Alert tone="info">
          <strong>Yeni sistem:</strong> İndi ana səhifədəki hər bölmə üçün məqalələri əl ilə seçə,
          sıralaya və idarə edə bilərsiniz. Drag-and-drop ilə məqalələrin yerini dəyişdirin və
          dərc olunan məqalələrdən axtarış edib əlavə edin.
        </Alert>

        {/* Dil seçimi */}
        <div className="flex items-center justify-between">
          <LocaleTabs active={locale} onChange={setLocale} />
        </div>

        {/* Bölmələr */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigate(section.id)}
              className="group rounded-lg border border-line bg-white p-5 text-left transition-all hover:border-bordo hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{section.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-ui text-sm font-semibold text-ink group-hover:text-bordo transition-colors">
                    {section.label}
                  </h3>
                  <p className="mt-1 font-ui text-xs text-muted line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Köməkçi məlumat */}
        <Panel
          title="Necə işləyir?"
          description="Ana səhifə redaksiya sistemi haqqında"
        >
          <div className="space-y-3 font-ui text-sm text-ink-soft">
            <p>
              <strong>1. Bölmə seçin:</strong> Yuxarıdakı kartlardan idarə etmək istədiyiniz bölməni seçin.
            </p>
            <p>
              <strong>2. Məqalə əlavə edin:</strong> Axtarış edib dərc olunmuş məqalələrdən seçin.
            </p>
            <p>
              <strong>3. Sıralayın:</strong> Drag-and-drop ilə və ya ox düymələri ilə məqalələrin sırasını dəyişdirin.
            </p>
            <p>
              <strong>4. Saxlayın:</strong> Dəyişiklikləri saxladıqdan sonra ana səhifə avtomatik yenilənir.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
