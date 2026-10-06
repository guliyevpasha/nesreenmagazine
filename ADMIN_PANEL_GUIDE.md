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
