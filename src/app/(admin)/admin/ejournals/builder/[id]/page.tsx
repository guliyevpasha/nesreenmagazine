"use client";

import { useParams } from "next/navigation";

import { Builder } from "@/components/admin/ejournal-builder/Builder";

export default function EjournalBuilderPage() {
  const params = useParams<{ id: string }>();
  return <Builder key={params.id} issueId={params.id} />;
}
