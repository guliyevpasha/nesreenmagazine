/**
 * Nesreen Magazine — loqo variantlarının baxış səhifəsi.
 *
 * Dizayn və proqramlaşdırma: Cradex Agency · https://cradexagency.com
 *
 * Bu səhifə yalnız variant seçmək üçündür. Seçim edildikdən sonra
 * bu qovluğu (src/app/(site)/[locale]/loqo) silmək olar.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Logo, {
  MonogramMark,
  RoseMark,
  type LogoVariant,
} from "@/components/Logo";
import { isLocale, locales } from "@/lib/i18n/config";

export const metadata: Metadata = {
  title: "Loqo variantları",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const VARIANTS: { key: LogoVariant; title: string; note: string }[] = [
  {
    key: "rose",
    title: "1 · Rose — açılmış yabanı gül",
    note: "Beş ləçəkli nəsrin gülü nazik xətlərlə, yanında klassik serif yazı. Ən sadə və ən oxunaqlı variant; kiçik ölçülərdə də formasını saxlayır.",
  },
  {
    key: "monogram",
    title: "2 · Monogram — «N» möhürü",
    note: "Gül ləçəkləri və yarpaqlarla əhatələnmiş dairəvi möhür. Brend nişanı kimi güclüdür, favicon və möhür/damğa işlərində ən yaxşı görünür.",
  },
  {
    key: "wreath",
    title: "3 · Wreath — gül budaqları",
    note: "Yazının iki tərəfində incə gül budaqları. Ən klassik, jurnal başlığı təsiri verir; çox kiçik ölçüdə budaqlar itir.",
  },
];

export default async function LogoPreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="container-mag py-14 lg:py-20">
      <header className="text-center">
        <span className="eyebrow text-gold">Daxili səhifə</span>
        <h1 className="mt-5 text-4xl sm:text-5xl">Loqo variantları</h1>
        <p className="mx-auto mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-soft">
          Üç variant da eyni beş ləçəkli nəsrin gülü üzərində qurulub. Seçdiyinizi
          bildirin — sayt boyunca (başlıq, footer, favicon) tətbiq olunacaq.
        </p>
      </header>

      <div className="mt-16 space-y-16">
        {VARIANTS.map((variant) => (
          <section key={variant.key} className="border border-line bg-paper">
            <div className="border-b border-line px-7 py-5">
              <h2 className="text-2xl">{variant.title}</h2>
              <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
                {variant.note}
              </p>
            </div>

            {/* Açıq fonda — üç ölçü */}
            <div className="flex flex-wrap items-end justify-center gap-x-16 gap-y-10 px-7 py-14">
              <div className="text-center">
                <Logo variant={variant.key} size="xl" className="text-ink" />
                <p className="mt-5 font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
                  Böyük
                </p>
              </div>
              <div className="text-center">
                <Logo variant={variant.key} size="lg" className="text-ink" />
                <p className="mt-5 font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
                  Başlıqda olduğu ölçü
                </p>
              </div>
              <div className="text-center">
                <Logo variant={variant.key} size="sm" className="text-ink" />
                <p className="mt-5 font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
                  Kiçik
                </p>
              </div>
            </div>

            {/* Tünd fonda — footer və çap üçün */}
            <div className="flex flex-wrap items-center justify-center gap-16 bg-bordo-deep px-7 py-14">
              <Logo variant={variant.key} size="lg" className="text-cream" />
              <Logo variant={variant.key} size="md" className="text-cream" markClassName="text-cream" />
            </div>

            {/* Yalnız nişan */}
            <div className="flex flex-wrap items-center justify-center gap-12 border-t border-line px-7 py-12">
              {variant.key === "monogram" ? (
                <>
                  <MonogramMark className="h-24 w-24 text-bordo" />
                  <MonogramMark className="h-12 w-12 text-bordo" />
                  <span className="flex h-10 w-10 items-center justify-center bg-bordo p-1.5">
                    <MonogramMark className="h-full w-full text-cream" strokeWidth={2} />
                  </span>
                </>
              ) : (
                <>
                  <RoseMark className="h-24 w-24 text-bordo" />
                  <RoseMark className="h-12 w-12 text-bordo" />
                  <span className="flex h-10 w-10 items-center justify-center bg-bordo p-1.5">
                    <RoseMark className="h-full w-full text-cream" strokeWidth={2.4} />
                  </span>
                </>
              )}
              <p className="w-full text-center font-ui text-[10px] uppercase tracking-[0.2em] text-muted">
                Yalnız nişan — favicon və sosial şəbəkə avatarı üçün
              </p>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-16 border border-gold/50 bg-cream-deep/50 p-7 text-center text-[0.9375rem] leading-relaxed text-ink-soft">
        Seçim <code className="font-mono text-[13px] text-bordo">src/components/Logo.tsx</code>{" "}
        faylındakı <code className="font-mono text-[13px] text-bordo">LOGO_VARIANT</code> sətri
        ilə tətbiq olunur. Hazırda aktiv variant: <strong>rose</strong>.
      </p>
    </div>
  );
}
