# Ana Səhifə İdarəetməsi - İstifadə Təlimatı

## 🚀 İlk dəfə istifadə

### 1. Boş bölmələri yaradın

İlk dəfə sistemə daxil olarkən bütün bölmələr üçün boş sənədlər yaratmalısınız:

1. Admin panelə daxil olun: `https://www.nesreenmagazine.com/admin/homepage-builder`
2. Səhifənin yuxarı hissəsində **"🌱 Boş bölmələr yarat"** düyməsini klikləyin
3. Təsdiq pəncərəsində "OK" klikləyin
4. Sistem 50 boş sənəd yaradacaq (10 bölmə × 5 dil)

**Nəticə:**
```
✅ Yaradıldı: 50
⏭️ Mövcud idi: 0  
📦 Ümumi: 50
```

### 2. Məqalə əlavə edin

Hər bölmə üçün:

1. Bölmə kartını seçin (məsələn, "Bu həftənin baş mövzusu")
2. Dil seçin (AZ/EN/RU/TR/AR)
3. "Məqalə əlavə et" bölməsində:
   - **Axtarış:** Məqalə başlığı, slug və ya ID daxil edin
   - **Kateqoriya:** Filtrlənmiş axtarış üçün seçin
   - **Alt kateqoriya:** Daha dəqiq filtrlənmiş axtarış
4. Nəticələrdən məqalə seçin → "Əlavə et" klikləyin
5. **Drag-and-drop** ilə sıralayın (və ya ox düymələri)
6. **"SAXLA"** düyməsini klikləyin

### 3. Sıralama

**Mouse ilə (Desktop):**
- Məqaləni tutub sürükləyin
- İstənilən yerə buraxın

**Klaviatura ilə (Mobil/Accessibility):**
- ↑ düyməsi → Yuxarı
- ↓ düyməsi → Aşağı

**Pozisiya nömrələri:**
- Hər məqalənin yanında #1, #2, #3... görünür
- Ana səhifədə bu sıra ilə göstərilir

---

## 📋 10 Bölmə Strukturu

| Bölmə | İdarə | Göstərilir | Yer |
|-------|-------|-----------|-----|
| Bu həftənin baş mövzusu | 20 | 20 | Hero carousel (6) + Grid (14) |
| Ən son | 20 | 15 | Latest articles grid |
| **Moda** - Redaksiya | 20 | 9 | Sol tərəf (3×3 grid) |
| **Moda** - Ən çox oxunanlar | 20 | 7 | Sağ sidebar |
| **Gözəllik** - Redaksiya | 20 | 9 | Sol tərəf (3×3 grid) |
| **Gözəllik** - Ən çox oxunanlar | 20 | 7 | Sağ sidebar |
| **Həyat tərzi** - Redaksiya | 20 | 9 | Sol tərəf (3×3 grid) |
| **Həyat tərzi** - Ən çox oxunanlar | 20 | 7 | Sağ sidebar |
| **Biznes** - Redaksiya | 20 | 9 | Sol tərəf (3×3 grid) |
| **Biznes** - Ən çox oxunanlar | 20 | 7 | Sağ sidebar |

**Ümumi:** 200 məqalə idarəsi (5 dil × 10 bölmə × 20 məqalə = 10,000 slot)

---

## ⚠️ Məhdudiyyətlər və Qaydalar

### Limitlər
- Hər bölmə üçün **maksimum 20 məqalə** əlavə edilə bilər
- Limit dolduqda xəbərdarlıq göstərilir
- Əvvəl məqalə silmədən yeni əlavə edilə bilməz

### Validasiya
✅ Yalnız **published** statuslu məqalələr əlavə edilə bilər  
✅ Dublikat məqalələr qəbul edilmir (eyni məqalə iki dəfə əlavə edilə bilməz)  
✅ Məqalə silinəndə avtomatik bütün bölmələrdən təmizlənir  
✅ Başqa bölmədə olan məqalə əlavə edilə bilər  

### Təhlükəsizlik
- Yalnız **admin** və **editor** rolları dəyişiklik edə bilər
- Hər dəyişiklik **audit log**-a yazılır (kim, nə vaxt, nə dəyişdi)
- Optimistic concurrency control (version control)

---

## 🔄 Avtomatik Yenilənmə

**ISR (Incremental Static Regeneration):**
- Ana səhifə hər **60 saniyə**də bir yenilənir
- Dəyişiklikləriniz 1 dəqiqə içində canlı saytda görünəcək
- Manuel revalidation: `/api/revalidate` endpoint-i

**Cache:**
- React `cache()` wrapper istifadə edir
- Server Component render başına bir dəfə yüklənir
- Parallel məqalə yükləmə (performans)

---

## 🐛 Problemlərlə Qarşılaşdıqda

### "Məlumatlar yüklənmədi"
**Səbəb:** Firestore-da sənəd yoxdur  
**Həll:** 
1. Ana səhifədən "🌱 Boş bölmələr yarat" düyməsini klikləyin
2. Və ya API vasitəsilə: `POST /api/admin/homepage-editorial/seed`
3. Və ya skript: `npx tsx scripts/seed-homepage-sections.ts` (permission xətası verə bilər)

### "Məqalə seçilməyib" / Boş nəticələr
**Səbəb 1:** Heç bir published məqalə yoxdur  
**Həll:** Ən azı bir məqaləni "Published" statusuna çevirin

**Səbəb 2:** Axtarış kriteriyası dar  
**Həll:** 
- Axtarış mətni qısaldın
- Kateqoriya filtrini çıxardın
- Başqa dildə cəhd edin

### "Permission denied"
**Səbəb:** İstifadəçi admin/editor deyil  
**Həll:** 
1. Firebase Console → Firestore → `staff/{email}`
2. `role: "admin"` və ya `role: "editor"` təyin edin
3. `active: true` olduğundan əmin olun

### Məqalə silinəndə bölmə pozulur?
**Yox!** Sistem avtomatik təmizləyir:
- `removeArticleFromAllSections()` funksiyası
- Məqalə bütün bölmələrdən silinir
- Digər məqalələrin mövqeyi normallaşdırılır

---

## 📊 Performans

**Yüklənmə sürəti:**
- Homepage render: ~200-300ms (cache ilə)
- API response: ~100-150ms
- Parallel fetch: 10 bölmə eyni anda

**Optimizasiya:**
- `HomepageArticleCache` - yüngül məqalə obyekti
- `React.cache()` - duplikat sorğuları aradan qaldırır
- ISR 60s - statik generation

---

## 👥 Audit Log

Hər dəyişiklik qeyd olunur:

```typescript
{
  sectionId: "moda-editorial",
  locale: "az",
  action: "reorder",
  beforeArticleIds: ["abc123", "def456"],
  afterArticleIds: ["def456", "abc123"],
  performedBy: "user_uid",
  performedByName: "Paşa Quliyev",
  performedAt: "2026-11-09T04:40:00.000Z"
}
```

**Baxmaq üçün:**
Firebase Console → Firestore → `homepageEditorialAudit` collection

---

## 🛠️ Developer Məlumatı

### API Endpoints

**GET** `/api/admin/homepage-editorial?sectionId=moda-editorial&locale=az`  
Bölmə konfiqurasiyasını və məqalələri yüklə

**POST** `/api/admin/homepage-editorial`  
Body: `{ sectionId, locale, articleIds[] }`  
Bölməni saxla

**POST** `/api/admin/homepage-editorial/seed`  
Bütün boş bölmələri yarat (admin only)

**GET** `/api/admin/articles/search?q=moda&status=published&limit=50`  
Məqalə axtarışı

**GET** `/api/admin/homepage-editorial/placements?articleId=abc123`  
Məqalənin yerləşdiyi bölmələri tap

### Fayllar

```
src/
├── app/
│   ├── (admin)/admin/homepage-builder/
│   │   ├── page.tsx                    # Ana səhifə (bölmə siyahısı)
│   │   └── [sectionId]/page.tsx        # Bölmə redaktəsi
│   ├── api/admin/
│   │   ├── homepage-editorial/
│   │   │   ├── route.ts                # GET/POST main API
│   │   │   ├── seed/route.ts           # Seed API
│   │   │   └── placements/route.ts     # Placements API
│   │   └── articles/search/route.ts    # Search API
│   └── (site)/[locale]/page.tsx        # Frontend homepage
├── components/admin/
│   ├── DraggableArticleList.tsx        # Drag-and-drop siyahı
│   ├── ArticlePicker.tsx               # Məqalə seçici
│   └── ArticleHomepagePlacements.tsx   # Məqalə yerləşməsi
└── lib/
    ├── data/
    │   ├── homepage-editorial.ts       # Core logic
    │   └── admin-homepage.ts           # Admin API helpers
    └── types.ts                        # TypeScript types

scripts/
└── seed-homepage-sections.ts           # Seed skripti

firestore.rules                         # Security rules
```

---

## ✅ Test Checklist

Deployment sonrası yoxlamaq:

- [ ] Admin panel açılır: `/admin/homepage-builder`
- [ ] "Boş bölmələr yarat" işləyir
- [ ] Hər bölmə açılır və boşdur
- [ ] Məqalə axtarışı nəticə qaytarır
- [ ] Məqalə əlavə edilir
- [ ] Drag-and-drop işləyir
- [ ] Ox düymələri işləyir (mobil)
- [ ] SAXLA düyməsi işləyir
- [ ] Ana səhifə yenilənir (60s sonra)
- [ ] 5 dil üçün ayrı-ayrı işləyir
- [ ] Audit log yazılır

---

**Developed by Cradex Agency**  
https://cradexagency.com
