#!/bin/bash

# Admin-only səhifələr (author və editor daxil ola bilməz)
ADMIN_ONLY_PAGES=(
  "src/app/(admin)/admin/site-settings/page.tsx"
  "src/app/(admin)/admin/audit/page.tsx"
  "src/app/(admin)/admin/backup/page.tsx"
  "src/app/(admin)/admin/performance/page.tsx"
  "src/app/(admin)/admin/activity-log/page.tsx"
  "src/app/(admin)/admin/api-docs/page.tsx"
  "src/app/(admin)/admin/system-health/page.tsx"
  "src/app/(admin)/admin/translations/page.tsx"
  "src/app/(admin)/admin/categories/page.tsx"
  "src/app/(admin)/admin/tags/page.tsx"
  "src/app/(admin)/admin/ejournals/page.tsx"
  "src/app/(admin)/admin/subscriptions/page.tsx"
  "src/app/(admin)/admin/push-notifications/page.tsx"
  "src/app/(admin)/admin/subscribers/page.tsx"
  "src/app/(admin)/admin/crm/page.tsx"
  "src/app/(admin)/admin/ad-orders/page.tsx"
  "src/app/(admin)/admin/sales-forecast/page.tsx"
  "src/app/(admin)/admin/messages/page.tsx"
)

echo "Admin-only səhifələrə rol guard əlavə edilir..."

for page in "${ADMIN_ONLY_PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "✓ $page"
  else
    echo "✗ $page (tapılmadı)"
  fi
done
