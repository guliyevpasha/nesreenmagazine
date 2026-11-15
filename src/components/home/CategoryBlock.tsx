import ArticleCard from "@/components/ArticleCard";
import EditorialHeading from "@/components/home/EditorialHeading";
import type { Locale } from "@/lib/i18n/config";
import type { Article } from "@/lib/types";

/**
 * Ana səhifədə bir bölmənin bloku:
 *  - nömrəli başlıq;
 *  - solda iri şəkil, mətn şəklin üstündə;
 *  - sağda bölmənin digər yazıları (kiçik şəkilli siyahı) və «Hamısına bax» düyməsi.
 * Bölmədə bir məqalə olanda o, yan-yana «hero» kart kimi göstərilir.
 */
export default function CategoryBlock({
  title,
  href,
  viewAllLabel,
  articles,
  locale,
  shaded = false,
}: {
  title: string;
  href: string;
  viewAllLabel: string;
  articles: Article[];
  locale: Locale;
  shaded?: boolean;
}) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const list = rest.slice(0, 4);

  return (
    <section className={shaded ? "bg-cream-deep/55" : ""}>
      <div className="container-mag py-16 lg:py-24">
        <EditorialHeading
          title={title}
          action={{ label: viewAllLabel, href }}
        />

        <div className="mt-12">
          {list.length === 0 ? (
            <ArticleCard article={lead} locale={locale} variant="hero" />
          ) : (
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="aspect-[4/5] sm:aspect-[16/11] lg:col-span-7 lg:aspect-auto">
                <ArticleCard article={lead} locale={locale} variant="overlay" />
              </div>

              <div className="flex flex-col lg:col-span-5">
                <div className="divide-y divide-line border-y border-line">
                  {list.map((article) => (
                    <div key={article.id} className="py-6">
                      <ArticleCard article={article} locale={locale} variant="row" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
