import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const revalidate = 86400; // 24 saatlıq cache

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "az") as Locale;
  const dict = getDictionary(locale);

  return {
    title: dict.footer.about,
    description: "Nesreen Magazine haqqında ətraflı məlumat",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <div className="container-mag py-16 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-display lg:text-4xl">
          {dict.footer.about}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-lg text-gray-600 mb-6">
            Nesreen Magazine — qadının dünyasına fərqli baxan, modadan gözəlliyə, astrologiyadan biznesə qədər geniş spektrli mövzuları əhatə edən rəqəmsal jurnal.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Bizim missiyamız</h2>
          <p>
            Biz qadını qəliblərə sığdırılan deyil, öz yolunu seçən, özünü ifadə edən və öz dünyasını yaradan bir fərd kimi görürük. 
            Nesreen Magazine-də trendlərin arxasınca qaçmırıq — onların qadının həyatındakı mənasını axtarırıq.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Nesreen nə deməkdir?</h2>
          <p>
            Nesreen — yabanı gül deməkdir. Təbiiliyi, zərifliyi və özünəməxsusluğu ilə seçilən, qayğı göstərilmədən belə böyüyüb 
            ən gözlənilməz yerdə çiçək açan bir gül. Bu da məhz bizim fəlsəfəmizdir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Bizim komandam</h2>
          <p>
            Nesreen Magazine komandası müxtəlif sahələrdən olan peşəkarlardan ibarətdir: jurnalistlər, redaktorlar, 
            dizayner və təhlilçilər. Hamımızı birləşdirən odur ki, qadının dünyasını daha yaxından tanımaq və anlamaq istəyirik.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Əlaqə</h2>
          <p>
            Sual, təklif və ya əməkdaşlıq barədə bizə yazmaq istəyirsinizsə, 
            <a href="/az/elaqe" className="text-bordo hover:text-bordo-deep"> əlaqə səhifəmizi </a>
            ziyarət edin.
          </p>
        </div>
      </div>
    </div>
  );
}