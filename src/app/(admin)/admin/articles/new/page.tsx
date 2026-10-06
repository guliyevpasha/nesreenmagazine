"use client";

import ArticleEditor from "@/components/admin/ArticleEditor";
import { PageHeader } from "@/components/admin/ui";

export default function NewArticlePage() {
  return (
    <>
      <PageHeader
        title="Yeni məqalə"
        description="Azərbaycan dili mütləqdir; qalan dilləri sonra da doldura bilərsiniz."
      />
      <ArticleEditor />
    </>
  );
}
