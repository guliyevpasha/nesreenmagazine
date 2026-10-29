# 🔧 Məqalə Görünmə Problemi - Həll

## Problem
Admin paneldə yazdığınız məqalələr Firebase-də düzgün saxlanılır, ancaq saytda görünmür.

## Səbəb
Next.js cache sistemi köhnə məlumatları saxlayır və yeni məqalələr görünmür.

## ✅ Həll

### 1. Firebase-də məqalələri yoxlayın
```bash
npx tsx scripts/check-articles-status.ts
```

Bu skript Firebase-də olan bütün məqalələri və onların statuslarını göstərəcək.

### 2. Cache-i təmizləyin

**Variant A: Dev serverdə (tövsiyə edilir)**
```bash
# Dev serveri işə salın
npm run dev

# Başqa terminalda cache-i təmizləyin
npx tsx scripts/clear-cache.ts
```

**Variant B: Production-da**
```bash
# Build və start
npm run build
npm start
```

### 3. Brauzerdə səhifəni yeniləyin
- **Chrome/Edge**: `Ctrl + Shift + R` (Windows) və ya `Cmd + Shift + R` (Mac)
- **Firefox**: `Ctrl + F5` (Windows) və ya `Cmd + Shift + R` (Mac)

### 4. Məqalələri yoxlayın
- Ana səhifə: http://localhost:3000/az
- Moda kateqoriyası: http://localhost:3000/az/moda

---

## 🔍 Debug Skriptləri

### Firebase məqalələrini yoxla
```bash
npx tsx scripts/check-articles-status.ts
```
Bu skript göstərir:
- Ümumi məqalə sayı
- Hər məqalənin statusu (draft, published, scheduled)
- Son dəyişiklik tarixləri

### Cache təmizlə
```bash
npx tsx scripts/clear-cache.ts
```
Bu skript:
- Bütün dil versiyalarının cache-ini təmizləyir
- Kateqoriya səhifələrini yeniləyir
- Məqalə səhifələrini yeniləyir

### Draft məqalələri publish et
```bash
npx tsx scripts/bulk-publish-articles.ts
```
Bu skript:
- Bütün draft məqalələri tapır
- Təsdiq istəyir
- Hamısını published statusuna keçirir

---

## 🆕 Yeni Məqalə Dərc Etdikdə

Admin paneldə məqalə yazdıqdan sonra:

1. **Status seçin**: Dərc seçimi dropdown-dan `✅ Dərc edilmiş` seçin
2. **İndi dərc et düyməsinə basın**: Bu avtomatik cache-i təmizləyəcək
3. **Brauzeri yeniləyin**: `Ctrl + Shift + R`
4. **Məqaləni yoxlayın**: Kateqoriya səhifəsində görünməlidir

> **Qeyd**: Sistem artıq avtomatik cache təmizləyir, əl ilə təmizləməyə ehtiyac yoxdur!

---

## ❓ Problemlər Davam Edirsə

### Problem 1: Məqalə Firebase-də yoxdur
```bash
# Firebase məqalələri yoxlayın
npx tsx scripts/check-articles-status.ts

# Əgər məqalə yoxdursa, admin paneldə yenidən yaradın və published edin
```

### Problem 2: Məqalə draft statusundadır
```bash
# Bütün draft məqalələri published edin
npx tsx scripts/bulk-publish-articles.ts
```

### Problem 3: Cache təmizlənmir
```bash
# Dev serveri restart edin
# Terminal-da Ctrl+C basın və yenidən başladın
npm run dev

# Və ya .next qovluğunu silin
Remove-Item -Recurse -Force .next
npm run dev
```

### Problem 4: Məqalə published ama görünmür
```bash
# Hard cache clear
Remove-Item -Recurse -Force .next
npm run dev

# Brauzerdə
# Ctrl + Shift + Delete -> Cache-i silin
```

---

## 🎯 Növbəti Addımlar

1. ✅ Bütün məqalələr published statusundadır
2. ✅ Cache avtomatik təmizlənmə konfiqurasiya edilib
3. ✅ Debug skriptləri hazırdır
4. 💡 Dev serveri restart edin və test edin

---

## 📞 Əlavə Kömək

Əgər problem davam edirsə:
1. Browser developer console-da xətalara baxın (F12)
2. Server terminal loglarına baxın
3. `scripts/check-articles-status.ts` nəticəsini göndərin
