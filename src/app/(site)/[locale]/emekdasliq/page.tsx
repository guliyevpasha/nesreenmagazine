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
    title: dict.footer.advertising,
    description: "Nesreen Magazine ilə əməkdaşlıq imkanları",
  };
}

export default async function PartnershipPage({
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
          {dict.footer.advertising}
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-lg text-gray-600 mb-6">
            Nesreen Magazine ilə əməkdaşlıq edərək brendinizi düzgün auditoriyaya çatdırın. 
            Biz keyfiyyətli məzmun və etik reklamçılığa əsaslanan tərəfdaşlıqlar qururuq.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Əməkdaşlıq növləri</h2>
          
          <h3 className="text-lg font-medium mt-6 mb-3">Rəqəmsal reklam</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Banner reklamları (müxtəlif ölçülər)</li>
            <li>Native məzmun (sponsored articles)</li>
            <li>Newsletter sponsorluğu</li>
            <li>Sosial media partnering</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">Məzmun əməkdaşlığı</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Brend ambassador proqramları</li>
            <li>Məhsul tanıtımları və rəylər</li>
            <li>Eksklüziv müsahibələr</li>
            <li>Event iştirakı və media partnerliyi</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-3">Çap nəşri</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tam səhifə reklamlar</li>
            <li>İnfomerşal məqalələr</li>
            <li>Məhsul kataloqu</li>
            <li>Insert və ekstra materiallar</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Bizim auditoriyamız</h2>
          <p>
            Nesreen Magazine oxuyucuları əsasən 25-45 yaş aralığında olan, orta və yuxarı gəlir səviyyəsinə malik, 
            moda, gözəllik və həyat tərzindən maraqlanan qadınlardır. Oxuyucularımızın 70%-i şəhər sakinləridir.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">Media kit</h2>
          <p>
            Ətraflı auditoriya statistikası, reklam formatları və qiymət siyahısı üçün media kit-imizi tələb edin. 
            Bütün əməkdaşlıq təklifləri fərdi olaraq qiymətləndirilir.
          </p>

          <div className="bg-cream-deep/30 p-6 rounded-lg mt-8">
            <h3 className="text-lg font-semibold mb-3">Bizə müraciət edin</h3>
            <p className="mb-4">
              Əməkdaşlıq barədə danışmaq üçün bizə yazın:
            </p>
            <p>
              <strong>E-poçt:</strong> <a href="mailto:partnership@nesreenmagazine.com" className="text-bordo hover:text-bordo-deep">partnership@nesreenmagazine.com</a><br />
              <strong>Telefon:</strong> +994 xx xxx xx xx
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}