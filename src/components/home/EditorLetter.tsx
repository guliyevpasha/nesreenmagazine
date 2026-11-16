import { RoseMark } from "@/components/Logo";
import type { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * «Redaktordan» bölməsi (ana səhifə).
 * ARXİVDƏ: hazırda ana səhifədə göstərilmir. Yenidən aktiv etmək üçün
 * `src/app/(site)/[locale]/page.tsx`-də `SHOW_EDITOR_LETTER = true` edin.
 * Mətnlər: `dict.home.editor*` (5 dildə saxlanılıb).
 */
export default function EditorLetter({ dict }: { dict: ReturnType<typeof getDictionary> }) {
  return (
    <section className="relative overflow-hidden bg-bordo-deep py-10 text-cream sm:py-12 lg:py-14">
      <RoseMark
        className="pointer-events-none absolute -end-14 -top-14 h-32 w-32 text-cream/[0.05] sm:h-38 sm:w-38 lg:h-44 lg:w-44"
        strokeWidth={0.5}
      />
      <RoseMark
        className="pointer-events-none absolute -bottom-16 -start-8 h-28 w-28 text-cream/[0.03] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
        strokeWidth={0.5}
      />

      <div className="container-mag relative">
        <p className="eyebrow text-center text-gold-soft text-[9px] tracking-wider">{dict.home.editorTitle}</p>

        {/* Giriş — bölmənin yeganə böyük səsi */}
        <p className="mx-auto mt-4 max-w-[30ch] text-center font-display text-[1.05rem] italic leading-[1.28] sm:mt-5 sm:max-w-[36ch] sm:text-[1.25rem] lg:max-w-[40ch] lg:text-[1.4rem]">
          {dict.home.editorLead}
        </p>

        {/* Gövdə — geniş ekranda iki sütun */}
        <div className="mx-auto mt-5 grid max-w-[54ch] gap-3.5 text-[0.8125rem] leading-[1.65] text-cream/70 sm:mt-6 sm:text-[0.84375rem] lg:max-w-2xl lg:grid-cols-2 lg:gap-x-8">
          {dict.home.editorBody.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>

        {/* Vurğu sətri — qızılı cizgilər arasında */}
        <p className="mx-auto mt-6 max-w-[40ch] border-y border-gold/20 py-3.5 text-center font-display text-[0.89rem] leading-[1.48] text-gold-soft sm:mt-7 sm:text-[0.98rem]">
          {dict.home.editorPull}
        </p>

        {/* Bağlayış və imza */}
        <p className="mx-auto mt-5 max-w-[36ch] text-center font-display text-[0.89rem] italic leading-[1.42] sm:mt-6 sm:text-[0.98rem]">
          {dict.home.editorClosing}
        </p>
        <div className="mx-auto mt-4 h-px w-10 bg-gold sm:mt-5 sm:w-12" aria-hidden="true" />
        <p className="mt-2.5 text-center font-ui text-[8px] uppercase tracking-[0.22em] text-cream/55 sm:text-[9px]">
          {dict.home.editorSignature}
        </p>
      </div>
    </section>
  );
}
