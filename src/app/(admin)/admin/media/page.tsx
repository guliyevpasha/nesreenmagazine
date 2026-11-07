import { redirect } from "next/navigation";

/**
 * Köhnə «Media» səhifəsi Firebase Storage-ı birbaşa oxuyurdu. Storage pulsuz
 * planda aktiv olmadığı üçün bütün fayllar Cloudinary-də saxlanılır və
 * «Fayl İdarəetməsi» bölməsində idarə olunur.
 */
export default function MediaPage() {
  redirect("/admin/files");
}
