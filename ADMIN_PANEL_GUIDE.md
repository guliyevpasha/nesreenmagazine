# 🎛️ Nesreen Magazine - Admin Panel Təlimatı

## 📋 Mövcud Xüsusiyyətlər

### ✅ Hazır olan funksiyalar:

1. **Firebase Authentication**
   - Email/Password ilə giriş
   - Protected routes
   - Session idarəetməsi

2. **Firestore Database Strukturu**
   - Articles (məqalələr)
   - Horoscopes (bürc proqnozları)
   - E-journals (PDF jurnallar)
   - Advertisements (reklam bannerləri)
   - Staff (heyət üzvləri)
   - Contacts (əlaqə mesajları)
   - Newsletters (abunəçilər)

3. **Image Upload System**
   - Drag & Drop yükləmə
   - Firebase Storage inteqrasiyası
   - Şəkil validasiyası
   - Avtomatik ölçü hesablanması

4. **Məqalə İdarəetməsi**
   - ✅ 5 dil dəstəyi (Az, En, Ru, Tr, Ar)
   - ✅ Cover şəkil yükləmə
   - ✅ Kateqoriya seçimi
   - ✅ Status: draft/published/scheduled
   - ✅ Featured options (Hero, Trending, Featured)
   - ✅ SEO ayarları (meta title, description, keywords)
   - ⏳ Redaktə funksiyası (növbəti addım)
   - ⏳ Silmə və kopyalama (növbəti addım)

5. **Google Analytics Hazırlığı**
   - GA4 helper functions
   - Event tracking
   - Analytics types
   - ⏳ Dashboard statistika görünüşü (növbəti addım)

## 🚀 Quraşdırma Addımları

### 1. Firebase Layihəsi Yaradın

1. [Firebase Console](https://console.firebase.google.com/) açın
2. "Add project" düyməsinə klikləyin
3. Layihə adı: `nesreenmagazine`
4. Google Analytics: Enable (optional)
5. Create project

### 2. Firebase Konfiqurasiyası

**Authentication Aktivləşdirin:**
1. Sol menyudan `Authentication` → `Get started`
2. `Email/Password` aktivləşdirin
3. İlk istifadəçi əlavə edin:
   - Email: `admin@nesreenmagazine.com`
   - Password: (güclü şifrə)

**Firestore Database Yaradın:**
1. Sol menyudan `Firestore Database` → `Create database`
2. Location: `europe-west1` (Avropa)
3. Security rules: Test modunda başlayın

**Storage Aktivləşdirin:**
1. Sol menyudan `Storage` → `Get started`
2. Default location: `europe-west1`
3. Security rules: Test modunda başlayın

### 3. .env.local Faylını Konfiqurasiya Edin

Firebase Console-dan config məlumatlarını əldə edin:
1. Project Settings (⚙️) → Project settings
2. Scroll down → Your apps → Web app
3. Config object-i kopyalayın

`.env.local` faylını yeniləyin:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nesreenmagazine.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nesreenmagazine
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nesreenmagazine.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site URL
NEXT_PUBLIC_SITE_URL=https://nesreenmagazine.com
```

### 4. Development Server Başladın

```bash
npm run dev
```

Admin panel: http://localhost:3000/admin

## 🔐 Admin Panelə Daxil Olma

1. Browser-də açın: `http://localhost:3000/admin` (və ya `nesreenmagazine.com/admin`)
2. Email və şifrənizi daxil edin
3. Dashboard səhifəsi açılacaq

## 📝 Yeni Məqalə Yaratmaq

1. Dashboard → **"Yeni Məqalə"** düyməsi
2. **Dil tabları** ilə hər dili doldurun:
   - Başlıq (Azərbaycan dilində məcburi)
   - Slug (URL-də görünəcək)
   - Qısa məzmun
   - Tam məzmun (HTML dəstəyi var)

3. **Cover Şəkil Yükləyin:**
   - Drag & Drop və ya Click to upload
   - Tövsiyə olunan: 1200x675px
   - Max: 5MB

4. **Kateqoriya Seçin:**
   - Gündəm, Moda, Gözəllik, Həyat Tərzi, Biznes, Astrologiya
   - Alt-kateqoriya (optional)

5. **Status Seçin:**
   - Draft (Qaralama) - görünməyəcək
   - Published (Dərc edilmiş) - saytda görünəcək
   - Scheduled (Planlaşdırılmış) - müəyyən vaxtda

6. **Ana Səhifə Seçimləri:**
   - ✅ Bu həftənin baş mövzusu (Hero Carousel)
   - ✅ Çox oxunanlar (Trending)
   - ✅ Seçilmiş məqalə

7. **SEO Ayarları:**
   - Meta title (60 simvol)
   - Meta description (160 simvol)
   - Keywords (vergüllə ayrılmış)

8. **"Məqaləni yarat"** düyməsinə klikləyin

## 🖼️ Şəkil Ölçü Tələbləri

| Yerləşmə | Ölçü | İstifadə |
|----------|------|----------|
| Hero Carousel | 1200x675px (16:9) | Ana səhifə üst slider |
| Grid View | 800x600px (4:3) | Kateqoriya səhifələri |
| Compact Card | 600x400px (3:2) | Sidebar, kiçik kartlar |
| Thumbnail | 400x300px (4:3) | Siyahılar |

## 📊 Növbəti Addımlar (Development Roadmap)

### Prioritet 1 - Məqalə İdarəetməsi
- [ ] Məqalə redaktə səhifəsi
- [ ] Məqalə siyahı səhifəsi (filtrlə, axtarışla)
- [ ] Məqalə silmə funksiyası
- [ ] Məqalə kopyalama
- [ ] Toplu əməliyyatlar (bulk delete, bulk publish)

### Prioritet 2 - Astrologiya
- [ ] Bürc proqnozu əlavə et (günlük, həftəlik, aylıq)
- [ ] 12 bürc üçün forma
- [ ] 5 dil dəstəyi

### Prioritet 3 - E-Jurnal
- [ ] PDF yükləmə
- [ ] Cover şəkil
- [ ] 5 dildə məlumat
- [ ] Siyahı və idarəetmə

### Prioritet 4 - Reklam İdarəetməsi
- [ ] Banner yerləri (header, sidebar, footer, in-article)
- [ ] Şəkil/GIF yükləmə
- [ ] Link, başlama/bitmə tarixi
- [ ] Aktiv/deaktiv toggle
- [ ] İmpressiyalar və kliklər

### Prioritet 5 - Google Analytics Dashboard
- [ ] Real-time ziyarətçilər
- [ ] Trafik mənbələri (Organic, Social, Direct, Referral)
- [ ] Ən çox oxunan məqalələr
- [ ] Axtarış açar sözləri (Google Search Console API)
- [ ] Daxili link klikləmə statistikası
- [ ] Demografiya (Yaş, Cins, Coğrafiya)
- [ ] Cihaz statistikası
- [ ] Vaxt aralığı filterləri (saatlıq, günlük, həftəlik, aylıq, özəl)

### Prioritet 6 - CRM
- [ ] Əlaqə mesajları idarəetməsi
- [ ] Newsletter abunəçiləri siyahısı
- [ ] Heyət üzvləri idarəetməsi
- [ ] Şəkil kitabxanası (Media Library)

## 🔒 Firebase Security Rules (Production)

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin only access
    match /articles/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /staff/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /horoscopes/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Public write for contacts and newsletters
    match /contacts/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
    }
    
    match /newsletters/{document=**} {
      allow read: if request.auth != null;
      allow create: if true;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /articles/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /ejournals/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /ads/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /staff/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🎨 Admin Panel Dizayn

- **Rənglər:** Bordo (#7b2233) + Qızılı (#c9a227)
- **Font:** Playfair Display (display), Lora (body), Inter (UI)
- **Layout:** Sidebar navigation (toggle edilə bilir)
- **Responsive:** Desktop və mobil dəstəyi

## 📞 Dəstək

Suallarınız varsa və ya problemlə üzləşirsinizsə:
- Firebase dokumentasiyası: https://firebase.google.com/docs
- Next.js dokumentasiyası: https://nextjs.org/docs


## 🌐 Avtomatik Tərcümə Sistemi

### Google Translate API Quraşdırması

1. **Google Cloud Console-a daxil olun:**
   - https://console.cloud.google.com/ açın
   - Layihə yaradın və ya mövcud layihəni seçin

2. **Cloud Translation API aktivləşdirin:**
   - Sol menyudan **APIs & Services** → **Library**
   - "Cloud Translation API" axtarın
   - **Enable** düyməsinə klikləyin

3. **API Key yaradın:**
   - **APIs & Services** → **Credentials**
   - **Create Credentials** → **API Key**
   - API key-i kopyalayın

4. **API Key-i təhlükəsizləşdirin (tövsiyə olunur):**
   - Yaradılmış key-ə klikləyin
   - **API restrictions** → **Restrict key**
   - **Cloud Translation API** seçin
   - **Application restrictions** → **HTTP referrers**
   - Domain əlavə edin: `*.nesreenmagazine.com/*`

5. **.env.local faylına əlavə edin:**
   ```env
   GOOGLE_TRANSLATE_API_KEY=AIza...your_key_here
   ```

6. **Development server-i yenidən başladın:**
   ```bash
   npm run dev
   ```

### Tərcümə Funksiyasının İstifadəsi

#### Məqalə Redaktorunda

1. Məqalə yaradın və ya mövcud məqaləni redaktə edin
2. **Azərbaycan dilində** başlıq, xülasə və mətn yazın
3. **"🌐 Avtomatik tərcümə"** düyməsinə klikləyin
4. Mənbə dili (**az**) və hədəf dili seçin (məs. **en**)
5. **"Tərcümə et"** düyməsinə klikləyin
6. Progress bar tərcümə gedişatını göstərəcək
7. Tərcümə bitdikdə, seçilmiş dilə avtomatik keçid edəcək
8. **Mütləq tərcüməni yoxlayın və düzəliş edin!**

#### API Endpoint-ləri

**Tək mətn tərcüməsi:**
```typescript
POST /api/translate
{
  "text": "Salam dünya",
  "sourceLanguage": "az",
  "targetLanguage": "en"
}

Response:
{
  "translatedText": "Hello world",
  "detectedLanguage": "az"
}
```

**Batch tərcümə (bir neçə mətn):**
```typescript
PUT /api/translate
{
  "texts": ["Salam", "Necəsən?", "Salamat qal"],
  "sourceLanguage": "az",
  "targetLanguage": "en"
}

Response:
{
  "translations": [
    { "translatedText": "Hello" },
    { "translatedText": "How are you?" },
    { "translatedText": "Goodbye" }
  ]
}
```

### Dəstəklənən Dillər

- 🇦🇿 Azərbaycan (az) - Əsas dil
- 🇬🇧 İngilis (en)
- 🇷🇺 Rus (ru)
- 🇹🇷 Türk (tr)
- 🇸🇦 Ərəb (ar)

### Məhdudiyyətlər və Qeydlər

- **Tərcümə keyfiyyəti:** Google Translate AI tərcüməsi 100% dəqiq olmaya bilər
- **Redaktə məcburidir:** Tərcümə edilmiş mətnləri mütləq yoxlayın
- **Uzun mətnlər:** Uzun məqalələr avtomatik hissələrə bölünür
- **Markdown formatı:** Link və HTML strukturu qorunmağa çalışılır
- **API limiti:** Google-un aylıq pulsuz limitini nəzərə alın
- **Cost:** 500,000+ simvol/ay üçün ödəniş tələb oluna bilər

### Xəta Həlli

**"Google Translate API key konfiqurasiya edilməyib"**
- `.env.local` faylında `GOOGLE_TRANSLATE_API_KEY` əlavə edin
- Server-i restart edin

**"API error 403"**
- API key-in aktivləşdirildiyini yoxlayın
- Billing-in aktivləşdirildiyini yoxlayın (credit card əlavə edin)
- API restrictions düzgün qurulub

**"API error 429"**
- Aylıq limit keçilib
- Billing plan yüksəldin və ya gözləyin

**Tərcümə yarımçıq qalır**
- Çox uzun mətnlər üçün chunk size-ı kiçildin
- İnternet bağlantısını yoxlayın
- Browser console-da error-lara baxın

### Best Practices

1. **Mənbə dil həmişə Azərbaycan olsun** - ən keyfiyyətli məzmun
2. **Hər dili ayrıca yoxlayın** - avtomatik tərcüməyə tam güvənməyin
3. **Xüsusi terminlər** - sahə xüsusi terminləri manual düzəldin
4. **Mədəni kontekst** - idiomalar və məhəlli ifadələri uyğunlaşdırın
5. **Markdown və linklər** - tərcümədən sonra link və format yoxlayın
6. **SEO metadata** - meta title və description ayrıca optimize edin



## ⏰ Planlaşdırılmış Tapşırıqlar (Scheduled Jobs)

### Backend Job Trigger Sistemi

Sistem avtomatik olaraq planlaşdırılmış məqalələri dərc edir və reklamları aktivləşdirir/deaktiv edir.

### Necə İşləyir?

**Avtomatik əməliyyatlar:**
1. **Scheduled → Published**: Vaxtı çatan məqalələr avtomatik dərc edilir
2. **Scheduled → Active**: Başlanğıc tarixi çatan reklamlar aktivləşir
3. **Active → Expired**: Bitmə tarixi keçən reklamlar dayandırılır

### Vercel Cron Quraşdırması (Tövsiyə olunur)

Vercel-də deploy edilmiş layihələr üçün built-in cron istifadə edin:

1. **vercel.json faylı artıq konfiqurasiya olunub:**
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/publish-scheduled",
         "schedule": "*/10 * * * *"
       }
     ]
   }
   ```

2. **Schedule format (Cron expression):**
   - `*/10 * * * *` - Hər 10 dəqiqədə bir
   - `*/5 * * * *` - Hər 5 dəqiqədə bir (daha tez-tez)
   - `0 * * * *` - Hər saat başında
   - `0 0 * * *` - Hər gün gecə yarısı

3. **Deploy edin:**
   ```bash
   vercel --prod
   ```

4. **Yoxlayın:**
   - Vercel Dashboard → Settings → Cron Jobs
   - Son icraları görə bilərsiniz
   - Logs → [CRON] prefix ilə məlumatlar

### Təhlükəsizlik (Security)

**CRON_SECRET_KEY əlavə edin:**

1. Təsadüfi güclü key yaradın:
   ```bash
   # PowerShell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   
   # Və ya online: https://randomkeygen.com/
   ```

2. `.env.local` və Vercel Environment Variables-a əlavə edin:
   ```env
   CRON_SECRET_KEY=abc123xyz789YourRandomSecretHere
   ```

3. Cron job avtomatik bu key-i yoxlayır və unauthorized çağırışları rədd edir.

### Manual Test

**Admin paneldən test edin:**

1. Admin → **Scheduled Jobs** səhifəsinə keçin
2. "▶ İndi İşlət" düyməsinə klikləyin
3. Nəticələrə baxın:
   - Neçə məqalə dərc edildi
   - Neçə reklam aktivləşdi
   - Neçə reklam dayandırıldı
   - Xəta varsa göstərilir

**API ilə test:**
```bash
# Local
curl http://localhost:3000/api/cron/publish-scheduled

# Production (secret key ilə)
curl -H "Authorization: Bearer YOUR_SECRET_KEY" \
  https://nesreenmagazine.com/api/cron/publish-scheduled
```

### Alternativ: Xarici Cron Service

Vercel istifadə etmirsinizsə və ya daha çevik konfiqurasiya istəyirsinizsə:

#### 1. cron-job.org (Tövsiyə)

- **Sayt:** https://cron-job.org
- **Qiymət:** Pulsuz
- **Minimum interval:** 1 dəqiqə
- **Quraşdırma:**
  1. Hesab yaradın
  2. New Cronjob → URL: `https://nesreenmagazine.com/api/cron/publish-scheduled`
  3. Schedule: `*/10 * * * *` (hər 10 dəqiqə)
  4. Headers → Add: `Authorization: Bearer YOUR_SECRET_KEY`
  5. Save & Enable

#### 2. EasyCron

- **Sayt:** https://www.easycron.com
- **Qiymət:** Pulsuz plan mövcuddur
- **Minimum interval:** 5 dəqiqə (free), 1 dəqiqə (paid)

#### 3. UptimeRobot

- **Sayt:** https://uptimerobot.com
- **Qiymət:** Pulsuz
- **Xüsusiyyət:** Monitoring + Cron
- **Interval:** 5 dəqiqə

### Monitoring və Debugging

**Vercel Logs:**
```
Vercel Dashboard → Deployments → Select Latest → Logs
Filter: [CRON]
```

**Log mesajları:**
```
[CRON] Scheduled tasks completed: {
  publishedArticles: 2,
  activatedAds: 1,
  deactivatedAds: 3,
  errors: []
}
```

**Xəta halında:**
- Error-lar `errors` array-də göstərilir
- Firestore permissions yoxlayın
- Environment variables düzgündür?
- Cron secret key düzdür?

### Planlaşdırılmış Məqalə Yaratmaq

1. **Məqalə redaktorunda:**
   - Məqaləni yazın
   - "Planlaşdırılmış dərc" sahəsində gələcək tarix-vaxt seçin
   - Status: **Scheduled** seçin
   - Yadda saxlayın

2. **Nə olur:**
   - Məqalə `status: "scheduled"` olaraq saxlanır
   - Public saytda görünmür
   - Cron job hər 10 dəqiqədə yoxlayır
   - Vaxt çatdıqda avtomatik `status: "published"` olur
   - Məqalə saytda görünməyə başlayır

### Planlaşdırılmış Reklam

1. **Reklam formasında:**
   - Reklam məlumatlarını daxil edin
   - `startsAt` - başlanğıc tarixi
   - `endsAt` - bitmə tarixi
   - Status: **Scheduled**

2. **Avtomatik lifecycle:**
   - `scheduled` → `active` (startsAt tarixi çatır)
   - `active` → `expired` (endsAt tarixi keçir)

### Best Practices

✅ **Tövsiyələr:**
- Hər həftə manual test edin
- Vercel logs-u izləyin
- Planlaşdırılmış məqalələri bir neçə dəqiqə əvvəl hazırlayın
- Minimum 15-30 dəqiqə əvvəl planlaşdırın (cron delay)

⚠️ **Diqqət:**
- Cron job 10 dəqiqədə bir işləyir
- Dəqiq saniyə ilə dərc olmur (±10 dəqiqə dəqiqlik)
- Daha dəqiq lazımsa, schedule interval-ı `*/5 * * * *` edin
- Çox tez-tez işləmək server yükünü artırır

### Troubleshooting

**Problem:** Scheduled məqalə published olmur
- ✓ Cron job işləyir? (Vercel Dashboard yoxlayın)
- ✓ scheduledAt tarixi keçmiş tarixdir?
- ✓ Status "scheduled" dir?
- ✓ Manual test edin admin paneldən

**Problem:** Unauthorized 401 error
- ✓ CRON_SECRET_KEY environment variable-da var?
- ✓ Authorization header düzdür?
- ✓ Vercel-də environment variable sync olub?

**Problem:** Firestore permission denied
- ✓ Firebase rules yoxlayın
- ✓ Service account permissions
- ✓ firestore.rules faylında update icazəsi

### Production Checklist

Canlı mühitə deploy etməzdən əvvəl:

- [ ] `vercel.json`-da cron konfiqurasiyası var
- [ ] `CRON_SECRET_KEY` environment variable əlavə edilib
- [ ] Vercel-ə deploy edilib
- [ ] Vercel Dashboard-da Cron Jobs aktiv göstərilir
- [ ] Manual test edilib və işləyir
- [ ] İlk scheduled məqalə yaradılıb və test edilib
- [ ] Monitoring qurulub (Slack, email notifications)

