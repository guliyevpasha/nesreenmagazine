# 📊 Nesreen Magazine - Analytics və İzləmə Sistemi

## ✅ Tamamlanan Funksiyalar

### 1. **Internal Analytics System (Firestore)**
Saytda öz daxili analytics sistemimiz artıq aktiv və işləkdir:

- ✅ **Məqalə baxış sayını izləmə**: Hər məqalənin baxış sayı real-time olaraq izlənir
- ✅ **Unikal ziyarətçi tracking**: localStorage vasitəsilə unikal ziyarətçilər müəyyən edilir
- ✅ **Günlük statistika**: Hər gün üçün ayrı-ayrı statistika toplanır
- ✅ **Admin paneldə göstərmə**: Admin məqalələr səhifəsində canlı statistika görsənir
  - Cəmi baxış sayı
  - Son 7 gündəki baxışlar
  - Son 30 gündəki baxışlar

#### Firestore Collections:
```
analytics_daily/        → Günlük statistika (məqalə ID + tarix)
analytics_totals/       → Ümumi statistika (məqalə ID)
analytics_visitors/     → Unikal ziyarətçilər (məqalə ID + ziyarətçi ID + tarix)
```

### 2. **Frontend İzləmə**
- ✅ **ViewTracker komponenti**: Hər məqalə səhifəsinə əlavə edilib
- ✅ **API endpoint**: `/api/track-view` - POST request ilə baxışları qeyd edir
- ✅ **localStorage**: Ziyarətçi ID-si saxlanılır və unikal tracking edir

### 3. **Admin Panel**
- ✅ **Məqalələr siyahısında baxış sayı**: Hər məqalənin yanında real-time statistika görsənir
- ✅ **"Baxış" sütunu**: 
  - Cəmi baxış sayı (böyük şriftlə)
  - Son 7 gündəki artım (kiçik şriftlə, 📈 emoji ilə)

### 4. **Mövcud Funksiyalar**
Kod bazasında mövcud və istifadə edilə bilən funksiyalar:

```typescript
// src/lib/analytics/track-views.ts

// Məqalə baxışını qeyd et
trackArticleView(articleId, slug, category, visitorId?)

// Məqalə statistikasını oxu
getArticleViews(articleId)
  → { totalViews, last7Days, last30Days, lastViewed }

// Ən çox baxılan məqalələr
getTopArticles(days, limit)

// Kateqoriya statistikası
getCategoryStats(days)

// Günlük trend
getDailyTrend(days)

// Ümumi statistika
getOverallStats()
  → { totalArticles, totalViews, viewsToday, viewsLast7Days, viewsLast30Days, avgViewsPerArticle }
```

---

## ⚠️ Konfiqurasiya Gözləyən: Google Analytics 4

### Google Analytics 4 Status
Google Analytics 4 inteqrasiyası üçün kod hazırdır, ancaq **environment variables konfiqurasiya edilməyib**.

#### Tələb olunan environment variables:
```bash
# .env.local faylında
GA4_PROPERTY_ID=           # Boş
GA4_SERVICE_ACCOUNT_KEY=   # Boş
```

### GA4 Konfiqurasiya Addımları

1. **Google Cloud Console-da Service Account yaradın**:
   - https://console.cloud.google.com/
   - IAM & Admin → Service Accounts
   - "Create Service Account" düyməsi
   - Rol: "Viewer" (Google Analytics API üçün)
   - JSON key file yükləyin

2. **Google Analytics Property ID-ni tapın**:
   - https://analytics.google.com/
   - Admin → Property Settings
   - Property ID-ni kopyalayın (məsələn: `123456789`)

3. **.env.local faylını yeniləyin**:
   ```bash
   GA4_PROPERTY_ID=123456789
   GA4_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'
   ```

4. **Service Account-a Analytics-ə giriş verin**:
   - Google Analytics → Admin → Property Access Management
   - "Add users" → Service Account email-ini əlavə edin
   - Rol: "Viewer"

### GA4 API Endpoint
```
GET /api/analytics?metric=activeUsers&days=30
```

Bu endpoint hazırda environment variables olmadığı üçün işləmir, ancaq konfiqurasiya edildikdən sonra istifadə edilə bilər.

---

## 🎯 İstifadə Nümunələri

### Admin paneldə məqalə statistikalarını görmək:
1. `/admin/articles` səhifəsinə daxil olun
2. Hər məqalənin yanında "Baxış" sütununda:
   - **Cəmi baxış sayı** (məsələn: 1,234)
   - **Son 7 gün** (məsələn: 📈 89 son 7 gün)

### Yeni məqalənin baxışlarını izləmək:
1. Məqaləni dərc edin (`status: "published"`)
2. Frontend-də məqaləni açın
3. 1-2 saniyə sonra ViewTracker avtomatik olaraq baxışı qeyd edəcək
4. Admin paneldə məqalələr səhifəsini yeniləyin - statistika görünəcək

### Top məqalələri əldə etmək:
```typescript
import { getTopArticles } from "@/lib/analytics/track-views";

const topArticles = await getTopArticles(30, 10); // Son 30 gündə top 10
```

---

## 🔧 Texniki Detallar

### Firestore İndeksləri
Aşağıdakı Firestore indeksləri yaradılmalıdır:

```json
{
  "indexes": [
    {
      "collectionGroup": "analytics_daily",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "articleId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "analytics_daily",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Firebase Console-da avtomatik olaraq indeks yaratma linki görsənəcək.

### Firestore Rules
```javascript
match /analytics_daily/{docId} {
  allow read: if request.auth != null;
  allow write: if true; // Public tracking üçün
}

match /analytics_totals/{articleId} {
  allow read: if request.auth != null;
  allow write: if true; // Public tracking üçün
}

match /analytics_visitors/{docId} {
  allow read: if request.auth != null;
  allow write: if true; // Unikal ziyarətçi tracking üçün
}
```

---

## 📈 Gələcək Təkmilləşdirmələr

### Prioritet 1: Dashboard Analytics
- [ ] Admin dashboard-da ümumi statistika paneli
- [ ] Günlük/Həftəlik/Aylıq trend qrafikləri
- [ ] Kateqoriya üzrə baxış sayı
- [ ] Real-time aktiv oxucu sayı

### Prioritet 2: Məqalə Səhifəsində Statistika
- [ ] Hər məqalədə baxış sayını göstərmək
- [ ] "Ən çox oxunanlar" widgeti

### Prioritet 3: GA4 İnteqrasiyası
- [ ] Environment variables konfiqurasiyası
- [ ] GA4 API testləri
- [ ] GA4 və Firestore məlumatlarının müqayisəsi

---

## 🐛 Troubleshooting

### Statistika görsənmirsə:
1. Firebase Console-da Firestore collections-ı yoxlayın
2. Browser DevTools → Network → `/api/track-view` request-i yoxlayın
3. Browser Console-da xəta mesajlarını yoxlayın

### Unikal ziyarətçilər sayılmırsa:
1. Browser localStorage-ın aktiv olduğunu yoxlayın
2. `nesreen_visitor_id` key-inin mövcudluğunu yoxlayın
3. Incognito mode-da yeni ziyarətçi ID-si yaranmalıdır

### Admin paneldə baxış sayı yüklənmirsə:
1. Firestore rules-ı yoxlayın (admin istifadəçisi authentication olmalıdır)
2. Console-da `getArticleViews()` xətalarını yoxlayın
3. Firestore indekslərinin yaradıldığını təsdiq edin

---

## 📞 Əlaqə və Dəstək

Bu sənəd analytics sisteminin tam texniki sənədləşməsidir. Suallar və ya problemlər üçün:
- Firestore Console: https://console.firebase.google.com/
- Google Analytics: https://analytics.google.com/
- Code base: `src/lib/analytics/` və `src/app/api/track-view/`
