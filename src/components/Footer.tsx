"use client";

import Link from "next/link";
import { useState } from "react";

import Logo from "@/components/Logo";
import NewsletterForm from "@/components/NewsletterForm";
import { AGENCY } from "@/lib/agency";
import { categories } from "@/lib/categories";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { routes } from "@/lib/routes";

const SOCIAL = [
  {
    name: "Instagram",
    href: "https://instagram.com/nesreenmagazine",
    path: "M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z",
  },
  {
    name: "Facebook",
    href: "https://facebook.com/nesreenmagazine",
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3 0-1.3-.1-2.45-.1-2.4 0-4.05 1.5-4.05 4.2v2.2H7.5V13h2.7v8h3.3Z",
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/nesreenmagazine",
    path: "M12 2.2a9.8 9.8 0 0 0-3.6 18.9c-.08-.8-.15-2 .03-2.86.17-.78 1.1-4.7 1.1-4.7s-.28-.57-.28-1.4c0-1.32.76-2.3 1.72-2.3.8 0 1.2.6 1.2 1.34 0 .82-.52 2.04-.79 3.18-.22.95.48 1.73 1.42 1.73 1.7 0 3-1.8 3-4.38 0-2.29-1.65-3.9-4-3.9a4.15 4.15 0 0 0-4.32 4.16c0 .82.31 1.7.71 2.18.08.1.09.18.07.28l-.27 1.1c-.04.18-.14.22-.32.13-1.2-.56-1.95-2.3-1.95-3.72 0-3.02 2.2-5.8 6.34-5.8 3.33 0 5.92 2.37 5.92 5.54 0 3.3-2.08 5.96-4.97 5.96-.97 0-1.88-.5-2.19-1.1l-.6 2.28c-.22.83-.8 1.88-1.2 2.51A9.8 9.8 0 1 0 12 2.2Z",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@nesreenmagazine",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z",
  },
];

export default function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Studiya imzası: mətn beş dildədir, agentliyin adı isə hər dildə eyni qalır
  // və ayrıca link kimi verilir.
  const [creditBefore, creditAfter = ""] = dict.footer.credit.split("{agency}");

  return (
    <>
      <footer className="mt-24 bg-bordo-deep text-cream">
        <div className="rule-gold" />

        <div className="container-mag py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Loqo və təsvir */}
            <div className="lg:col-span-4">
              <Logo size="lg" markClassName="text-gold" className="text-cream" />
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-cream/70">
                {dict.footer.tagline}
              </p>

              <div className="mt-7">
                <p className="eyebrow text-gold-soft">{dict.footer.follow}</p>
                <div className="mt-3 flex gap-3">
                  {SOCIAL.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex h-10 w-10 items-center justify-center border border-cream/20 text-cream/80 transition-colors hover:border-gold hover:text-gold"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Bölmələr */}
            <nav className="lg:col-span-2" aria-label={dict.footer.sections}>
              <p className="eyebrow text-gold-soft">{dict.footer.sections}</p>
              <ul className="mt-5 space-y-3">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={routes.category(locale, category.slug)}
                      className="text-[0.9375rem] text-cream/75 transition-colors hover:text-gold-soft"
                    >
                      {category.name[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Keçidlər */}
            <nav className="lg:col-span-3" aria-label={dict.footer.magazine}>
              <p className="eyebrow text-gold-soft">{dict.footer.magazine}</p>
              <ul className="mt-5 space-y-3">
                <li>
                  <Link href={routes.about(locale)} className="text-[0.9375rem] text-cream/75 transition-colors hover:text-gold-soft">
                    {dict.footer.about}
                  </Link>
                </li>
                <li>
                  <Link href={routes.subscribe(locale)} className="text-[0.9375rem] text-cream/75 transition-colors hover:text-gold-soft">
                    {dict.nav.subscribe}
                  </Link>
                </li>
                <li>
                  <Link href={routes.issues(locale)} className="text-[0.9375rem] text-cream/75 transition-colors hover:text-gold-soft">
                    {dict.nav.issues}
                  </Link>
                </li>
                <li>
                  <Link href={routes.partnership(locale)} className="text-[0.9375rem] text-cream/75 transition-colors hover:text-gold-soft">
                    {dict.footer.advertising}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Məktub */}
            <div className="lg:col-span-3">
              <p className="eyebrow text-gold-soft">{dict.footer.newsletterTitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                {dict.home.newsletterText}
              </p>
              <div className="mt-5">
                <NewsletterForm locale={locale} variant="dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Alt zolaq */}
        <div className="border-t border-cream/15">
          <div className="container-mag flex flex-col-reverse items-center justify-between gap-3 py-6 text-center sm:flex-row sm:gap-4 sm:text-start">
            <p className="text-balance font-ui text-[11px] tracking-wider text-cream/55">
              © {year} Nesreen Magazine. {dict.footer.rights}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <button 
                onClick={() => setShowPrivacy(true)}
                className="font-ui text-[11px] tracking-wider text-cream/55 transition-colors hover:text-gold-soft cursor-pointer"
              >
                {dict.footer.privacy}
              </button>
              <button 
                onClick={() => setShowTerms(true)}
                className="font-ui text-[11px] tracking-wider text-cream/55 transition-colors hover:text-gold-soft cursor-pointer"
              >
                {dict.footer.terms}
              </button>
            </div>
          </div>
        </div>

        {/* Studiya imzası */}
        <div className="border-t border-cream/10 bg-black/15">
          <div className="container-mag py-4 text-center">
            <p className="font-ui text-[11px] tracking-wider text-cream/45">
              {creditBefore}
              <a
                href={AGENCY.url}
                target="_blank"
                rel="noopener"
                className="link-underline font-medium text-cream/75 transition-colors hover:text-gold-soft"
              >
                {AGENCY.name}
              </a>
              {creditAfter}
            </p>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dict.footer.privacy}</h2>
              <button 
                onClick={() => setShowPrivacy(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-sm text-gray-700 leading-relaxed">
              <p className="mb-4">
                Bu məxfilik siyasəti Nesreen Magazine saytında şəxsi məlumatlarınızın necə toplandığı və istifadə edildiyi barədə məlumat verir.
              </p>
              <h3 className="font-semibold mb-2">Topladığımız məlumatlar:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Newsletter abunəliyi üçün e-poçt ünvanı</li>
                <li>Əlaqə formu vasitəsilə göndərilən şəxsi məlumatlar</li>
                <li>Sayt istifadəsi haqqında analitik məlumatlar</li>
              </ul>
              <h3 className="font-semibold mb-2">Məlumatların istifadəsi:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Newsletter göndərmək üçün</li>
                <li>Sorğularınıza cavab vermək üçün</li>
                <li>Sayt performansını təkmilləşdirmək üçün</li>
              </ul>
              <p className="mb-4">
                Şəxsi məlumatlarınız üçüncü tərəflərə satılmır və ya paylaşılmır. İstədiyiniz zaman newsletter abunəliyindən çıxa bilərsiniz.
              </p>
              <p className="text-xs text-gray-500">
                Son yenilənmə: {new Date().toLocaleDateString(locale === 'az' ? 'az-AZ' : locale)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white rounded-lg">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dict.footer.terms}</h2>
              <button 
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-sm text-gray-700 leading-relaxed">
              <p className="mb-4">
                Bu istifadə şərtləri Nesreen Magazine saytından istifadə qaydalarını müəyyən edir.
              </p>
              <h3 className="font-semibold mb-2">İstifadə qaydaları:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Sayt məzmunu yalnız şəxsi istifadə üçündir</li>
                <li>Məqalələri icazəsiz kopyalamaq qadağandır</li>
                <li>Saytda təhqiredici və ya qanunuzə zidd məzmun paylaşmaq olmaz</li>
              </ul>
              <h3 className="font-semibold mb-2">Məsuliyyət:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Sayt məzmunu "olduğu kimi" təqdim edilir</li>
                <li>Məlumatların dəqiqliyinə zəmanət verilmir</li>
                <li>İstifadəçilər öz riskləri ilə saytdan istifadə edirlər</li>
              </ul>
              <h3 className="font-semibold mb-2">Müəlliflik hüquqları:</h3>
              <p className="mb-4">
                Saytdakı bütün məzmun Nesreen Magazine-ə məxsusdur və müəlliflik hüquqları ilə qorunur.
              </p>
              <p className="text-xs text-gray-500">
                Son yenilənmə: {new Date().toLocaleDateString(locale === 'az' ? 'az-AZ' : locale)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}