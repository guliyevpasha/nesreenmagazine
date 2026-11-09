# Test Addımları - Homepage Builder

## Problem: Məqalə axtarışda görünmür

### 1. Yoxlama: Neçə Published məqalə var?

Firebase Console açın:
1. https://console.firebase.google.com/
2. `nesreen-magazine` proyekti
3. Firestore Database
4. `articles` collection
5. Filtrlə: `status == published`

**Nəticə:** Cəmi 8 published məqalə var.

### 2. Test: Kateqoriya ilə axtarış

1. Admin Panel: `/admin/homepage-builder/weekly-main-topic?locale=az`
2. Məqalə əlavə et bölməsində:
   - Axtarış: **BOŞ BURAXIN**
   - Kateqoriya: **Gündəm** seçin
   - Alt kateqoriya: Hamısı

**Gözləmə:** Gündəm kateqoriyasında published məqalələr görünəcək.

### 3. Test: Başlıq ilə axtarış

1. Axtarış sahəsinə sadəcə bir neçə hərf yazın:
   - ❌ YOX: `nesreenmagazine.com/az/gundem/saba-tumur...` (URL)
   - ✅ BƏLİ: `saba` (qısa axtarış)
   - ✅ BƏLİ: `tumur` (qısa axtarış)

**Gözləmə:** Başlıqda "saba" olan məqalələr görünəcək.

### 4. Əgər hələ də görünmürsə

**Səbəb 1:** Məqalə published deyil

Həlli:
1. `/admin/articles` açın
2. Həmin məqaləni tapın
3. Status: **Published** təyin edin
4. Yenidən axtarın

**Səbəb 2:** Məqalə artıq əlavə edilib

Həlli:
- "Seçilmiş məqalələr" bölməsinə baxın
- Əgər orada varsa, artıq əlavə edilib
- Artıq əlavə edilmiş məqalələr axtarışda göstərilmir

**Səbəb 3:** Browser cache

Həlli:
- Səhifəni yeniləyin (Ctrl+F5)
- Və ya browser console açıb error yoxlayın

### 5. Browser Console Debug

1. F12 basın (Developer Tools)
2. Console tabına keçin
3. Axtarış edin
4. Network tabına keçin
5. `/api/admin/articles/search` sorğusuna baxın
6. Response-da neçə məqalə var?

**Gözləmə:**
```json
{
  "articles": [ ... ],
  "count": 8
}
```

### 6. Manuel Test

Əgər heç bir məqalə yoxdursa və ya az məqalə varsa:

1. Seed məqalələr yaradın:
   ```
   npx tsx scripts/seed.ts
   ```

2. Və ya əl ilə məqalə yaradın:
   - `/admin/articles` açın
   - "Yeni məqalə" klikləyin
   - Başlıq, məzmun, kateqoriya əlavə edin
   - **Status: Published** təyin edin
   - Saxlayın

3. Homepage Builder-ə qayıdın və axtarın

---

## Deployment Sonrası Test

Vercel-ə deploy edildikdən sonra:

1. `https://www.nesreenmagazine.com/admin/homepage-builder` açın
2. "🌱 Boş bölmələr yarat" klikləyin
3. `weekly-main-topic` bölməsini açın
4. Məqalə axtarın:
   - Kateqoriya: Gündəm
   - Axtarış: boş buraxın
5. Nəticələri görəcəksiniz

---

## FAQ

**S: URL copy-paste edə bilərəm?**  
C: Bəli! İndi avtomatik slug çıxarılır:
```
Input:  nesreenmagazine.com/az/gundem/saba-tumur-seksi-heyat
Output: saba-tumur-seksi-heyat (axtarışda)
```

**S: Neçə məqalə əlavə edə bilərəm?**  
C: Hər bölmə üçün maksimum 20 məqalə.

**S: Eyni məqalə fərqli bölmələrdə ola bilər?**  
C: Bəli! Məsələn, həm "Bu həftənin baş mövzusu"nda, həm "Ən son"da.

**S: Məqalə silinəndə nə olur?**  
C: Avtomatik bütün bölmələrdən təmizlənir.

**S: Dəyişikliklər nə vaxt görünür?**  
C: Ana səhifə 60 saniyə ISR ilə yenilənir. 1 dəqiqə gözləyin.

---

**Developed by Cradex Agency**
