"use client";

import { categories } from "@/lib/categories";

/**
 * Banner üçün bölmə (kateqoriya) hədəfləməsi.
 * Heç nə seçilməyibsə banner bütün bölmələrdə göstərilir; seçilibsə yalnız həmin bölmələrdə
 * (və onların alt bölmələrində) — məqalənin kateqoriyasına görə.
 */
export default function BannerCategoryPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const allSelected = value.length === 0;

  function toggle(slug: string) {
    onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  }

  return (
    <div data-testid="banner-category-picker">
      <label
        className={`mb-3 flex cursor-pointer items-center gap-3 border p-4 transition-colors ${
          allSelected ? "border-bordo bg-bordo/5" : "border-line hover:border-bordo/30"
        }`}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => onChange([])}
          data-testid="banner-cat-all"
          className="h-4 w-4 accent-bordo"
        />
        <span className="text-sm text-ink">Bütün bölmələrdə (məhdudiyyət yoxdur)</span>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const checked = value.includes(cat.slug);
          return (
            <label
              key={cat.slug}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                checked ? "border-bordo bg-bordo/5" : "border-line hover:border-bordo/30"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(cat.slug)}
                data-testid={`banner-cat-${cat.slug}`}
                className="mt-0.5 h-4 w-4 accent-bordo"
              />
              <span>
                <span className="block text-sm text-ink">{cat.name.az}</span>
                <span className="block text-xs text-muted">
                  + {cat.subcategories.map((s) => s.name.az).join(", ")}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-muted">
        {allSelected
          ? "Banner bütün bölmələrdə görünəcək."
          : "Banner yalnız seçilmiş bölmələrdə və onların alt bölmələrində görünəcək; digər bölmələrdə və ana səhifədə görünməyəcək."}
      </p>
    </div>
  );
}
