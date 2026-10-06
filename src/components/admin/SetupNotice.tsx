"use client";

import Logo, { RoseMark } from "@/components/Logo";

const STEPS: { title: string; body: string; code?: string }[] = [
  {
    title: "1. Firebase layihəsi yaradın",
    body: "console.firebase.google.com ünvanına daxil olun → «Add project» → adı nesreen-magazine qoyun. Google Analytics istəyə bağlıdır.",
  },
  {
    title: "2. Veb tətbiqi əlavə edin",
    body: "Layihənin içində Web (</>) nişanına basın, adı «nesreen-web» yazın. Firebase sizə firebaseConfig açarlarını göstərəcək — həmin açarlar aşağıdakı fayla köçürülür.",
  },
  {
    title: "3. Xidmətləri aktiv edin",
    body: "Sol menyudan: Authentication → Sign-in method → Email/Password yandırın. Firestore Database → Create database → Production mode. Storage → Get started.",
  },
  {
    title: "4. Açarları layihəyə yazın",
    body: "Layihənin kök qovluğunda .env.local faylı yaradın və Firebase-in verdiyi dəyərləri yerinə yazın:",
    code: `NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Bu e-poçt ilk admin olacaq (vergüllə bir neçəsini yaza bilərsiniz)
NEXT_PUBLIC_ADMIN_EMAILS=sizin@mail.com

NEXT_PUBLIC_SITE_URL=https://nesreenmagazine.com`,
  },
  {
    title: "5. İlk admin hesabını açın",
    body: "Firebase → Authentication → Users → Add user: yuxarıda yazdığınız e-poçt və bir şifrə. Sonra serveri yenidən başladın (npm run dev) və bu səhifəyə qayıdın.",
  },
  {
    title: "6. Özünüzü redaksiya siyahısına yazın",
    body: "Firestore → Start collection → adı «staff». Sənədin ID-si sizin e-poçtunuz olmalıdır (kiçik hərflərlə), sahələr isə bunlardır. Bu addım vacibdir: təhlükəsizlik qaydaları icazəni məhz bu sənəddən oxuyur.",
    code: `Collection: staff
Document ID: sizin@mail.com

email      (string)  sizin@mail.com
name       (string)  Adınız Soyadınız
role       (string)  admin
active     (boolean) true
categories (array)   boş buraxın
createdAt  (string)  2026-09-05`,
  },
  {
    title: "7. Təhlükəsizlik qaydalarını qoyun",
    body: "Layihədəki firestore.rules və storage.rules fayllarının içindəkini Firebase konsolunda müvafiq «Rules» bölmələrinə yapışdırıb Publish edin. Bu olmadan baza hər kəsə açıq qalır.",
  },
  {
    title: "8. Hazır məqalələri bazaya köçürün",
    body: "Saytdakı 15 məqaləni və bürc şərhlərini Firestore-a yükləmək üçün terminalda bir dəfə bu əmri işlədin:",
    code: "npm run seed",
  },
];

/**
 * Firebase açarları hələ yazılmayıbsa admin panelin yerinə bu təlimat görünür.
 * Sayt bu müddətdə hazır məzmunla işləməyə davam edir.
 */
export default function SetupNotice() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="relative overflow-hidden bg-bordo-deep px-6 py-14 text-cream">
        <RoseMark
          className="pointer-events-none absolute -end-10 -top-14 h-72 w-72 text-cream/[0.07]"
          strokeWidth={0.6}
        />
        <div className="relative mx-auto max-w-3xl">
          <Logo size="md" className="text-cream" markClassName="text-gold" />
          <h1 className="mt-8 text-4xl">Admin paneli hazırdır — Firebase gözləyir</h1>
          <p className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-cream/75">
            Panelin bütün bölmələri (məqalələr, bürc şərhləri, bannerlər, mesajlar,
            işçilər) qurulub. İşə düşməsi üçün yalnız Firebase açarları lazımdır —
            aşağıdakı səkkiz addım təxminən 15 dəqiqə çəkir.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-14">
        <ol className="space-y-8">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-5">
              <span
                className="mt-1 font-display text-3xl leading-none text-gold-soft"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 border-b border-line pb-8">
                <h2 className="text-xl">{step.title.replace(/^\d+\.\s*/, "")}</h2>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {step.body}
                </p>
                {step.code && (
                  <pre className="mt-4 overflow-x-auto border border-line bg-paper p-4 font-mono text-[12.5px] leading-relaxed text-ink-soft">
                    {step.code}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 border border-gold/50 bg-cream-deep/50 p-7">
          <p className="eyebrow text-gold">Qeyd</p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
            Vercel-ə yüklədikdən sonra eyni açarları <strong>Vercel → Settings →
            Environment Variables</strong> bölməsinə də əlavə etməyi unutmayın.
            Əks halda sayt canlı domendə yenə hazır məzmunla işləyəcək.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a href="/az" className="btn-ghost">
            Sayta qayıt
          </a>
        </div>
      </div>
    </div>
  );
}
