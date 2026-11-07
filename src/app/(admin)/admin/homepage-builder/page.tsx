"use client";

import Link from "next/link";
import { PageHeader, Panel, Alert, Button } from "@/components/admin/ui";

/**
 * Ana səhifə blokları kodda sabitdir və məqalələr üzərindəki işarələrə görə
 * avtomatik formalaşır. Bu səhifədə redaktə imkanı yoxdur.
 */
export default function HomepageBuilderPage() {
  return (
    <>
      <PageHeader
        title="Ana Səhifə Builder"
        description="Ana səhifənin məzmunu necə formalaşır."
        actions={
          <Button disabled>
            Saxla
          </Button>
        }
      />

      <div className="px-6 py-6 lg:px-10 space-y-6">
        <Alert tone="info">
          Ana səhifə blokların əl ilə düzülməsi ilə deyil, avtomatik olaraq məqalə redaktorundakı
          işarələrə görə qurulur: <strong>&quot;Ana səhifənin baş məqaləsi&quot;</strong> və{" "}
          <strong>&quot;Çox oxunanlar&quot;</strong>. Blokların yerini dəyişmək, əlavə etmək və ya
          söndürmək üçün bu səhifədə hələ imkan yoxdur, buna görə redaktə idarəetmələri qeyri-aktivdir.
        </Alert>

        <Panel
          title="Ana səhifəni necə dəyişmək olar"
          description="Dəyişiklik məqalə səviyyəsində edilir."
        >
          <ol className="list-decimal space-y-2 pl-5 font-ui text-[14px] text-ink-soft">
            <li>Məqalələr bölməsindən istədiyiniz məqaləni açın.</li>
            <li>
              Ana səhifədə baş məqalə olması üçün &quot;Ana səhifənin baş məqaləsi&quot; işarəsini
              seçin.
            </li>
            <li>
              &quot;Çox oxunanlar&quot; siyahısına daxil etmək üçün müvafiq işarəni seçin və
              məqaləni dərc edin.
            </li>
          </ol>
          <div className="mt-5">
            <Link
              href="/admin/articles"
              className="font-ui text-[13px] underline underline-offset-4 text-ink"
            >
              Məqalələrə keç
            </Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
