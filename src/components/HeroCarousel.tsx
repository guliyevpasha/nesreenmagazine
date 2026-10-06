"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import type { Article } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

interface HeroCarouselProps {
  articles: Article[];
  locale: Locale;
  eyebrow: string;
}

export default function HeroCarousel({ articles, locale, eyebrow }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Avtomatik slayd dəyişməsi (5 saniyədə bir)
  useEffect(() => {
    if (!isAutoPlaying || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, articles.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // 10 saniyə sonra avtomatik rejimi yenidən başlat
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? articles.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % articles.length;
    goToSlide(newIndex);
  };

  if (articles.length === 0) return null;

  return (
    <section className="container-mag pt-10 pb-16 lg:pt-14 lg:pb-20">
      <p className="eyebrow mb-6 flex items-center gap-3 text-gold">
        <span className="h-px w-10 bg-gold" aria-hidden="true" />
        {eyebrow}
      </p>

      <div className="relative">
        {/* Əsas carousel container */}
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {articles.map((article, index) => (
              <div
                key={article.id}
                className="w-full flex-shrink-0"
              >
                <ArticleCard
                  article={article}
                  locale={locale}
                  variant="hero"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {articles.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-cream/90 p-3 text-ink shadow-lg backdrop-blur-sm transition-all hover:bg-cream hover:scale-110 lg:left-6"
              aria-label="Əvvəlki məqalə"
            >
              <svg
                className="h-5 w-5 lg:h-6 lg:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-cream/90 p-3 text-ink shadow-lg backdrop-blur-sm transition-all hover:bg-cream hover:scale-110 lg:right-6"
              aria-label="Növbəti məqalə"
            >
              <svg
                className="h-5 w-5 lg:h-6 lg:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Dots navigation */}
        {articles.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-gold"
                    : "w-2 bg-ink/20 hover:bg-ink/40"
                }`}
                aria-label={`Məqalə ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
