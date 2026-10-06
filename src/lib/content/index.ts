import type { Article } from "@/lib/types";

import { astrologiyaArticles } from "./articles/astrologiya";
import { biznesArticles } from "./articles/biznes";
import { gozellikArticles } from "./articles/gozellik";
import { gundemArticles } from "./articles/gundem";
import { heyatTerziArticles } from "./articles/heyat-terzi";
import { modaArticles } from "./articles/moda";

/**
 * Saytın başlanğıc məzmunu.
 *
 * Firebase qoşulmayana qədər sayt bu siyahı ilə işləyir. Firebase açarları
 * .env.local faylına yazılan kimi məlumat Firestore-dan gəlməyə başlayır,
 * bu siyahı isə yalnız ehtiyat nüsxə kimi qalır.
 *
 * Bu məqalələri Firestore-a köçürmək üçün: `npm run seed`
 */
export const seedArticles: Article[] = [
  ...gundemArticles,
  ...modaArticles,
  ...gozellikArticles,
  ...heyatTerziArticles,
  ...astrologiyaArticles,
  ...biznesArticles,
];
