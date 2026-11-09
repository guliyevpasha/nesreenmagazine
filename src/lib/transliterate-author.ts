/**
 * Müəllif adlarını avtomatik olaraq digər dillərə transliterasiya edir
 * 
 * Məsələn: "Paşa Quliyev" (az) → "Pasha Guliyev" (en), "Паша Гулиев" (ru)
 */

import type { Locale } from "@/lib/i18n/config";
import type { LocalizedText } from "@/lib/types";

/**
 * Azərbaycan hərflərini Latın hərflərinə çevirir (İngilis, Türk)
 */
function toLatin(text: string): string {
  const map: Record<string, string> = {
    'ə': 'a', 'Ə': 'A',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ü': 'u', 'Ü': 'U',
    'ğ': 'gh', 'Ğ': 'Gh',
    'ş': 'sh', 'Ş': 'Sh',
    'ç': 'ch', 'Ç': 'Ch',
  };
  
  return text.split('').map(char => map[char] || char).join('');
}

/**
 * Azərbaycan hərflərini Kiril əlifbasına çevirir (Rus)
 */
function toCyrillic(text: string): string {
  const map: Record<string, string> = {
    'a': 'а', 'A': 'А',
    'b': 'б', 'B': 'Б',
    'c': 'дж', 'C': 'Дж',
    'd': 'д', 'D': 'Д',
    'e': 'е', 'E': 'Е',
    'ə': 'я', 'Ə': 'Я',
    'f': 'ф', 'F': 'Ф',
    'g': 'г', 'G': 'Г',
    'ğ': 'г', 'Ğ': 'Г',
    'h': 'х', 'H': 'Х',
    'x': 'х', 'X': 'Х',
    'ı': 'ы', 'I': 'Ы',
    'i': 'и', 'İ': 'И',
    'j': 'ж', 'J': 'Ж',
    'k': 'к', 'K': 'К',
    'q': 'г', 'Q': 'Г',
    'l': 'л', 'L': 'Л',
    'm': 'м', 'M': 'М',
    'n': 'н', 'N': 'Н',
    'o': 'о', 'O': 'О',
    'ö': 'ё', 'Ö': 'Ё',
    'p': 'п', 'P': 'П',
    'r': 'р', 'R': 'Р',
    's': 'с', 'S': 'С',
    'ş': 'ш', 'Ş': 'Ш',
    't': 'т', 'T': 'Т',
    'u': 'у', 'U': 'У',
    'ü': 'ю', 'Ü': 'Ю',
    'v': 'в', 'V': 'В',
    'y': 'й', 'Y': 'Й',
    'z': 'з', 'Z': 'З',
    'ç': 'ч', 'Ç': 'Ч',
  };
  
  return text.split('').map(char => map[char] || char).join('');
}

/**
 * Azərbaycan hərflərini Ərəb əlifbasına çevirir
 */
function toArabic(text: string): string {
  const map: Record<string, string> = {
    'a': 'ا', 'A': 'ا',
    'b': 'ب', 'B': 'ب',
    'c': 'ج', 'C': 'ج',
    'd': 'د', 'D': 'د',
    'e': 'ي', 'E': 'ي',
    'ə': 'ا', 'Ə': 'ا',
    'f': 'ف', 'F': 'ف',
    'g': 'غ', 'G': 'غ',
    'ğ': 'غ', 'Ğ': 'غ',
    'h': 'ه', 'H': 'ه',
    'x': 'خ', 'X': 'خ',
    'ı': 'ي', 'I': 'ي',
    'i': 'ي', 'İ': 'ي',
    'j': 'ج', 'J': 'ج',
    'k': 'ك', 'K': 'ك',
    'q': 'ق', 'Q': 'ق',
    'l': 'ل', 'L': 'ل',
    'm': 'م', 'M': 'م',
    'n': 'ن', 'N': 'ن',
    'o': 'و', 'O': 'و',
    'ö': 'و', 'Ö': 'و',
    'p': 'پ', 'P': 'پ',
    'r': 'ر', 'R': 'ر',
    's': 'س', 'S': 'س',
    'ş': 'ش', 'Ş': 'ش',
    't': 'ت', 'T': 'ت',
    'u': 'و', 'U': 'و',
    'ü': 'و', 'Ü': 'و',
    'v': 'و', 'V': 'و',
    'y': 'ي', 'Y': 'ي',
    'z': 'ز', 'Z': 'ز',
    'ç': 'چ', 'Ç': 'چ',
  };
  
  return text.split('').map(char => map[char] || char).join('');
}

/**
 * Məlum müəllif adlarının əvvəlcədən hazırlanmış tərcümələri
 */
const KNOWN_AUTHORS: Record<string, LocalizedText> = {
  "Paşa Quliyev": {
    az: "Paşa Quliyev",
    en: "Pasha Guliyev",
    ru: "Паша Гулиев",
    tr: "Paşa Quliyev",
    ar: "باشا قولييف",
  },
  "Nesreen Magazine": {
    az: "Nesreen Magazine",
    en: "Nesreen Magazine",
    ru: "Nesreen Magazine",
    tr: "Nesreen Magazine",
    ar: "مجلة نسرين",
  },
  "Nesreen Redaksiyası": {
    az: "Nesreen Redaksiyası",
    en: "Nesreen Editorial",
    ru: "Редакция Nesreen",
    tr: "Nesreen Redaksiyonu",
    ar: "تحرير نسرين",
  },
  "Nesrin Abbasova": {
    az: "Nesrin Abbasova",
    en: "Nesrin Abbasova",
    ru: "Несрин Аббасова",
    tr: "Nesrin Abbasova",
    ar: "نسرين عباسوفا",
  },
};

/**
 * Müəllif adını avtomatik olaraq 5 dilə transliterasiya edir
 * 
 * @param authorName - Azərbaycan dilində müəllif adı
 * @returns 5 dildə müəllif adı
 */
export function transliterateAuthorName(authorName: string): LocalizedText {
  // Normalize et
  const normalized = authorName.trim();
  
  // Əgər məlum müəllifdirsə, əvvəlcədən hazırlanmış tərcüməni qaytar
  if (KNOWN_AUTHORS[normalized]) {
    return KNOWN_AUTHORS[normalized];
  }
  
  // Avtomatik transliterasiya
  return {
    az: normalized,
    en: toLatin(normalized),
    ru: toCyrillic(normalized),
    tr: normalized, // Türkcə Azərbaycan dilinə çox yaxındır
    ar: toArabic(normalized),
  };
}

/**
 * Müəllif adını bir string-dən LocalizedText-ə çevirir
 * Köhnə məqalələr üçün istifadə olunur
 */
export function convertAuthorToLocalized(author: string): LocalizedText {
  return transliterateAuthorName(author);
}
