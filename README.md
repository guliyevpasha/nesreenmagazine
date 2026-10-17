# Nesreen Magazine

Last updated: 2026-10-15

Qadınlar üçün moda, gözəllik, astrologiya, biznes və gündəm jurnalı.

Beş dilli sayt (AZ · EN · RU · TR · AR) və Firebase üzərində qurulmuş öz admin paneli.

Dizayn və proqramlaşdırma: **[Cradex Agency](https://cradexagency.com)**

---

## 1. Hazır olan nədir

**Sayt**

| Bölmə | Ünvan | Vəziyyət |
|---|---|---|
| Ana səhifə | `/az` | hazır |
| Gündəm | `/az/gundem` | 3 məqalə |
| Moda | `/az/moda` | 3 məqalə |
| Gözəllik | `/az/gozellik` | 3 məqalə |
| Həyat tərzi | `/az/heyat-terzi` | məzmun gözləyir |
| Astrologiya | `/az/astrologiya` | 3 məqalə + 12 bürc |
| Biznes | `/az/biznes` | 3 məqalə |
| Alt bölmə | `/az/moda/bolme/trendler` | 30 alt bölmə × 5 dil |
| Bürc səhifəsi | `/az/astrologiya/burc/libra` | 12 bürc × 5 dil |
| Əlaqə | `/az/elaqe` | forma + media-kit |
| Abunəlik | `/az/abunelik` | «tezliklə» səhifəsi |
| Jurnal → E-jurnal | `/az/e-jurnal` | admin paneldən PDF yüklənir |
| Jurnal → Nəşrlər | `/az/jurnallar` | «tezliklə» səhifəsi |
| Jurnal → Seçilənlər | `/az/secilenler` | seçilmiş və çox oxunan yazılar |
| Admin panel | `/admin` | hazır, Firebase gözləyir |

- **15 məqalə** — hər biri **beş dildə tam mətnlə**.
- **Bürc şərhləri** — 12 bürc × günlük/həftəlik/aylıq × 5 dil.
- **Astrologiya bölməsi** ELLE formatındadır: Günlük / Həftəlik / Aylıq / Tarot /
  Yüksələn bürc / Bürc uyğunluğu / Hədiyyə tövsiyələri nişanları və 12 bürc dairəsi.
  (Son dörd nişan «tezliklə» yazısı göstərir — admin paneldən doldurulacaq.)
- **5 reklam sahəsi**, hər biri standart IAB ölçüsündə.
- Axtarış, dil seçicisi, məktub abunəliyi, paylaşım düymələri, sitemap, robots.txt,
  hər məqalə üçün JSON-LD (Google üçün), hər dil üçün hreflang.

**Loqo** — üç variant hazırlanıb (`src/components/Logo.tsx`):
`rose` (standart), `monogram`, `wreath`. Dəyişmək üçün həmin faylda
`LOGO_VARIANT` sətrini redaktə etmək kifayətdir. Favicon: `src/app/icon.svg`.

---

## 2. Kompüterdə işə salmaq

```bash
npm install
npm run dev
```

Sayt: <http://localhost:3000> · Admin panel: <http://localhost:3000/admin>

Digər əmrlər:

```bash
npm run build      # istehsal versiyasını yığır
npm run typecheck  # tip səhvlərini yoxlayır
npm run seed       # hazır məzmunu Firestore-a köçürür
```

---

## 3. Firebase qurulumu

Açarlar yazılana qədər sayt `src/lib/content` qovluğundakı hazır məqalələrlə
işləyir — heç nə sınmır. Açarları yazan kimi məzmun Firestore-dan gəlməyə başlayır.

**Addım 1.** <https://console.firebase.google.com> → **Add project** → ad: `nesreen-magazine`.

**Addım 2.** Layihənin içində **Web (`</>`)** nişanına basın → ad: `nesreen-web`.
Firebase sizə `firebaseConfig` açarlarını göstərəcək.

**Addım 3.** Xidmətləri aktiv edin:
- **Authentication** → Sign-in method → **Email/Password** yandırın
- **Firestore Database** → Create database → **Production mode**
- **Storage** → Get started

**Addım 4.** Kök qovluqda `.env.local` faylı yaradın (nümunə: `.env.local.example`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nesreen-magazine.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nesreen-magazine
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nesreen-magazine.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

NEXT_PUBLIC_ADMIN_EMAILS=sizin@mail.com
NEXT_PUBLIC_SITE_URL=https://nesreenmagazine.com
```

**Addım 5.** Firebase → **Authentication → Users → Add user**: yuxarıdakı e-poçt və bir şifrə.

**Addım 6.** Firestore → **Start collection** → ad: `staff`.
Sənədin **ID-si sizin e-poçtunuz** olmalıdır (kiçik hərflərlə):

```
Collection: staff
Document ID: sizin@mail.com

email      (string)   sizin@mail.com
name       (string)   Adınız Soyadınız
role       (string)   admin
active     (boolean)  true
categories (array)    boş
createdAt  (string)   2026-09-05
```

> Bu addım vacibdir: təhlükəsizlik qaydaları icazəni məhz bu sənəddən oxuyur.
> `NEXT_PUBLIC_ADMIN_EMAILS` yalnız panelin görünməsi üçündür, bazaya yazmaq üçün yox.

**Addım 7.** Təhlükəsizlik qaydalarını qoyun:
- `firestore.rules` faylının içindəkini → Firestore → **Rules** → Publish
- `storage.rules` faylının içindəkini → Storage → **Rules** → Publish

**Addım 8.** Hazır məzmunu bazaya köçürün:

```bash
npm run seed
```

---

## 4. Admin panel

`/admin` ünvanında. Rənglər və üslub saytla eynidir — bordo yan menyu, krem iş sahəsi.

| Bölmə | Nə edir |
|---|---|
| **Panel** | Ümumi rəqəmlər, son məqalələr, bölmələr üzrə say |
| **Məqalələr** | Bütün məqalələr + hər kateqoriya üzrə ayrıca siyahı |
| **Yeni məqalə** | 5 dil nişanı, Markdown redaktoru, önizləmə, şəkil yükləmə |
| **Bürc şərhləri** | 12 bürc × günlük/həftəlik/aylıq × 5 dil |
| **Reklam bannerləri** | 5 sahə, şəkil yükləmə, tarix aralığı, aktiv/dayandır |
| **Mesajlar** | Əlaqə formasından gələn müraciətlər |
| **İşçilər** | Rol və bölmə icazələri (yalnız admin) |

**İşçi əlavə etmək (iki addım):**

1. Admin panel → **İşçilər** → ad, e-poçt, rol, bölmələr → **Əlavə et**
2. Firebase → **Authentication → Users → Add user** → eyni e-poçt + şifrə → şifrəni ona göndərin

**Rollar:**
- `admin` — hər şey: işçilər, bannerlər, silmə
- `editor` — bütün bölmələrdə yazır və redaktə edir
- `author` — yalnız ona açılan bölmələrdə yazır

**Məqalə yazarkən:** Azərbaycan dili mütləqdir, qalan dilləri sonra da doldura
bilərsiniz. Dil nişanının yanındakı qızılı nöqtə həmin dilin dolu olduğunu göstərir.
Boş qalan dildə oxucu Azərbaycan mətnini görür.

---

## 5. Vercel-ə yükləmək və domen

1. Layihəni GitHub-a yükləyin (`git init` → commit → push).
2. <https://vercel.com> → **Add New → Project** → həmin repozitoriyanı seçin.
3. **Environment Variables** bölməsinə `.env.local`-dakı **bütün** açarları köçürün.
   *(Bunu etməsəniz canlı sayt yenə hazır məzmunla işləyəcək — admin panel açılmayacaq.)*
4. **Deploy**.
5. **Settings → Domains** → domeninizi yazın və domen provayderinizdə Vercel-in
   göstərdiyi DNS yazılarını əlavə edin (adətən `A` → `76.76.21.21` və
   `CNAME www` → `cname.vercel-dns.com`).
6. Domen qoşulandan sonra `NEXT_PUBLIC_SITE_URL` dəyərini real domenlə yeniləyin
   və yenidən deploy edin — sitemap və paylaşım linkləri buna görə qurulur.

---

## 6. Reklam sahələri

| Sahə | Ölçü | Harada |
|---|---|---|
| `home-leaderboard` | 970 × 250 | Ana səhifə, «Ən son»dan sonra |
| `home-mid` | 728 × 90 | Bölmələr arasında |
| `category-top` | 970 × 250 | Bölmə başlığından sonra |
| `article-inline` | 640 × 160 | Məqalə mətninin ortasında |
| `sidebar` | 300 × 600 | Əlaqə səhifəsinin yanında |

Sahə boş olduqda oxucuya səliqəli «Bu sahə reklam üçün ayrılıb → Reklam yerləşdirin»
örtüyü görünür və klikləndikdə əlaqə səhifəsinə aparır.

---

## 7. Bilməli olduğunuz iki məqam

**Şəkillər.** Məqalələrin üz qabığında hazırda naxışlı örtük (gül motivi + bölmənin
rəngi) göstərilir — müəllif hüququ problemi olmasın deyə hazır foto qoyulmayıb.
Admin paneldən şəkil yüklədikcə örtüyün yerini real foto tutur. Üz qabığı üçün
tövsiyə olunan ölçü: **1600 × 2000 piksel**.

**Gündəm məqalələri köhnəlir.** Üç gündəm yazısı 2026-cı ilin sentyabr təqviminə
əsaslanır (Venesiya Kinofestivalı 2–12 sentyabr, Paris Moda Həftəsi 28 sentyabr –
6 oktyabr, Azerbaijan Fashion Week iyul). Dərc etməzdən əvvəl faktları bir daha
yoxlayın, sonra isə admin paneldən müntəzəm yeniləyin.

---

## 8. Fayl xəritəsi

```
src/
  app/
    (site)/[locale]/          sayt — dil önşəkilçili bütün səhifələr
      page.tsx                ana səhifə
      [category]/             bölmə səhifəsi (astrologiya xüsusi görünüşlə)
      [category]/[slug]/      məqalə səhifəsi
      astrologiya/burc/[sign] bürc səhifəsi
      elaqe · abunelik · jurnallar
    (admin)/admin/            idarə paneli
    globals.css               dizayn sistemi (rənglər, tipoqrafiya, komponentlər)
    icon.svg                  favicon
    sitemap.ts · robots.ts
  components/                 Logo, Header, Footer, ArticleCard, AdSlot, ZodiacIcon …
    admin/                    AdminShell, ArticleEditor, LoginScreen, SetupNotice, ui
  lib/
    agency.ts                 studiyanın adı və ünvanı (footer + meta)
    categories.ts             5 bölmə, adları və təsvirləri 5 dildə
    zodiac.ts                 12 bürc, element, planet, tarixlər
    types.ts                  Article, StaffMember, AdBanner
    routes.ts                 saytın bütün daxili ünvanları
    markdown.ts               təhlükəsiz Markdown → HTML
    fonts.ts                  Playfair Display · Lora · Inter · Noto Naskh
    i18n/                     dillər və interfeys mətnləri
    firebase/                 config, client, auth
    data/                     articles (sayt) · admin (CRUD)
    content/                  hazır 15 məqalə və bürc şərhləri
  proxy.ts                  /moda → /az/moda yönləndirməsi
scripts/seed.ts               məzmunu Firestore-a köçürür
firestore.rules · storage.rules
```

---

## 9. Növbəti aylar üçün

- **Abunəlik.** `/[locale]/abunelik` səhifəsi hazırdır. Ödəniş üçün Stripe və ya
  yerli provayder qoşulacaq; məqalə modelində `status` sahəsinin yanına `premium`
  bayrağı əlavə etmək kifayətdir.
- **Çap nəşri.** `/[locale]/jurnallar` səhifəsi hazırdır. Hər say üçün Firestore-da
  `issues` kolleksiyası və PDF/flipbook baxışı əlavə olunacaq.
- **Astrologiyanın qalan nişanları.** Tarot, Yüksələn bürc, Bürc uyğunluğu və
  Hədiyyə tövsiyələri — struktur hazırdır, məzmun gözləyir.

---

## 10. Texniki əsas

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Firebase
(Firestore + Auth + Storage) · Vercel.
Şriftlər: Playfair Display (başlıqlar), Lora (mətn), Inter (etiketlər),
Noto Naskh Arabic (ərəb dili).
Palet: krem `#fbf8f4` · bordo `#7b2233` · qızılı `#c9a227`.

---

## Müəllif

Sayt **[Cradex Agency](https://cradexagency.com)** tərəfindən layihələndirilib və hazırlanıb.
Studiyanın adı üç yerdə saxlanılır — dəyişmək lazım gələrsə bir faylı redaktə etmək kifayətdir:

| Yer | Fayl |
|---|---|
| Ad və ünvan | `src/lib/agency.ts` |
| Footer mətni (5 dil) | `src/lib/i18n/dictionaries.ts` → `footer.credit` |
| Meta məlumat (author / creator) | `src/app/(site)/[locale]/layout.tsx` |
