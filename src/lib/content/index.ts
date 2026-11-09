import type { Article } from "@/lib/types";

import { astrologiyaArticles } from "./articles/astrologiya";

/**
 * Saytın başlanğıc məzmunu.
 *
 * Firebase qoşulmayana qədər sayt bu siyahı ilə işləyir. Firebase açarları
 * .env.local faylına yazılan kimi məlumat Firestore-dan gəlməyə başlayır,
 * bu siyahı isə yalnız ehtiyat nüsxə kimi qalır.
 *
 * Bu məqalələri Firestore-a köçürmək üçün: `npm run seed`
 * 
 * Yalnız astrologiya bölməsindəki bürc məqalələri saxlanılıb.
 */
export const seedArticles: Article[] = [
  ...astrologiyaArticles,
];
