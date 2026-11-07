"use client";

import { useState } from "react";

type Field = { name: string; type: string; required: boolean; description: string };

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  /** Autentifikasiya tələbinin təsviri (boşdursa açıqdır). */
  auth?: string;
  parameters?: Field[];
  requestBody?: Field[];
  responseExample: string;
  category: string;
};

/** Yalnız src/app/api altında mövcud olan marşrutlar. */
const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/analytics",
    description:
      "Google Analytics 4 məlumatlarını qaytarır. GA4_PROPERTY_ID və GA4_SERVICE_ACCOUNT_KEY təyin olunmayıbsa 500 xətası verir.",
    parameters: [
      {
        name: "range",
        type: "string",
        required: false,
        description: "today, 7days, 30days (default), 90days, 180days, 365days",
      },
      { name: "start", type: "string", required: false, description: "Başlanğıc tarix (xüsusi aralıq üçün)" },
      { name: "end", type: "string", required: false, description: "Bitmə tarixi (xüsusi aralıq üçün)" },
    ],
    responseExample: `{
  "...overview": "ümumi göstəricilər",
  "byLanguage": [],
  "byAge": [],
  "byGender": [],
  "byCountry": [],
  "byCity": [],
  "bySources": [],
  "topArticles": [],
  "byTags": [],
  "byKeywords": [],
  "internalLinks": []
}`,
    category: "Analytics",
  },
  {
    method: "GET",
    path: "/api/seo/analytics",
    description: "Kateqoriya və dil üzrə ən performanslı açar sözlər və etiketlər.",
    parameters: [
      { name: "category", type: "string", required: true, description: "Kateqoriya slug-ı" },
      { name: "locale", type: "string", required: true, description: "Dil kodu (az, en, ru, tr, ar)" },
    ],
    responseExample: `{
  "topKeywords": [],
  "topTags": []
}`,
    category: "Analytics",
  },
  {
    method: "POST",
    path: "/api/track-view",
    description: "Məqalə baxışını qeyd edir.",
    requestBody: [
      { name: "articleId", type: "string", required: true, description: "Məqalə ID (maks. 100 simvol)" },
      { name: "slug", type: "string", required: true, description: "Məqalə slug-ı (maks. 200 simvol)" },
      { name: "category", type: "string", required: true, description: "Kateqoriya (maks. 50 simvol)" },
      { name: "visitorId", type: "string", required: false, description: "Ziyarətçi identifikatoru" },
    ],
    responseExample: `{ "success": true }`,
    category: "Analytics",
  },
  {
    method: "GET",
    path: "/api/banners/:location",
    description: "Verilən yer üçün ən yüksək prioritetli aktiv banneri qaytarır; yoxdursa banner null olur.",
    parameters: [
      { name: "location", type: "string", required: true, description: "Banner yeri (yol parametri)" },
    ],
    responseExample: `{ "banner": { "id": "...", "priority": 1 } }`,
    category: "Bannerlər",
  },
  {
    method: "POST",
    path: "/api/banner-impression",
    description: "Banner göstərilmə sayını artırır.",
    requestBody: [{ name: "bannerId", type: "string", required: true, description: "Banner ID" }],
    responseExample: `{ "success": true }`,
    category: "Bannerlər",
  },
  {
    method: "POST",
    path: "/api/banner-click",
    description: "Banner klik sayını artırır.",
    requestBody: [{ name: "bannerId", type: "string", required: true, description: "Banner ID" }],
    responseExample: `{ "success": true }`,
    category: "Bannerlər",
  },
  {
    method: "POST",
    path: "/api/subscribe",
    description: "Email ünvanını abunəçi siyahısına əlavə edir.",
    requestBody: [{ name: "email", type: "string", required: true, description: "Email ünvanı (maks. 200 simvol)" }],
    responseExample: `{ "success": true }`,
    category: "Abunəlik",
  },
  {
    method: "POST",
    path: "/api/admin/send-newsletter",
    description: "Aktiv abunəçilərə newsletter göndərir.",
    auth: "Admin rolunun Firebase ID tokeni (Authorization: Bearer <token>)",
    requestBody: [
      { name: "subject", type: "string", required: true, description: "Mövzu (ilk 200 simvol istifadə olunur)" },
      { name: "html", type: "string", required: true, description: "Məktubun HTML məzmunu" },
    ],
    responseExample: `{
  "success": true,
  "message": "Newsletter göndərildi: 10 uğurlu, 0 uğursuz",
  "sent": 10,
  "failed": 0
}`,
    category: "Abunəlik",
  },
  {
    method: "POST",
    path: "/api/revalidate",
    description: "Verilən yolların və teqlərin keşini təmizləyir.",
    auth: "Aktiv staff üzvünün Firebase ID tokeni, və ya server tokeni (Authorization: Bearer <token>)",
    requestBody: [
      { name: "paths", type: "string[]", required: false, description: "Təmizlənəcək yollar" },
      { name: "tags", type: "string[]", required: false, description: "Təmizlənəcək keş teqləri" },
      { name: "slug", type: "string", required: false, description: "category ilə birlikdə bütün dillər üçün yolları yaradır" },
      { name: "category", type: "string", required: false, description: "slug ilə birlikdə istifadə olunur" },
    ],
    responseExample: `{
  "revalidated": true,
  "now": 1760000000000,
  "paths": ["/az"],
  "tags": [],
  "message": "Cache successfully cleared"
}`,
    category: "Sistem",
  },
  {
    method: "GET",
    path: "/api/cron/publish-scheduled",
    description:
      "Planlaşdırılmış məqalələri dərc edir, reklamları aktivləşdirir və ya bitirir. POST ilə də çağırıla bilər. FIREBASE_SERVICE_ACCOUNT_KEY təyin olunmayıbsa 503 verir.",
    auth: "Authorization: Bearer <CRON_SECRET> və ya admin Firebase ID tokeni",
    responseExample: `{
  "success": true,
  "timestamp": "2026-10-15T10:00:00.000Z",
  "publishedArticles": 0,
  "activatedAds": 0,
  "deactivatedAds": 0,
  "errors": []
}`,
    category: "Sistem",
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);

  const categories = Array.from(new Set(API_ENDPOINTS.map((e) => e.category)));

  function getMethodColor(method: string): string {
    switch (method) {
      case "GET":
        return "bg-blue-500 text-white";
      case "POST":
        return "bg-green-500 text-white";
      case "PUT":
        return "bg-yellow-500 text-white";
      case "DELETE":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground">
          NESREEN Magazine-in mövcud API endpoint-ləri və istifadə qaydaları
        </p>
      </div>

      {/* API Info */}
      <div className="border rounded-lg p-6 bg-blue-50">
        <h2 className="text-lg font-bold mb-3">Əsas Məlumat</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Base URL:</strong>{" "}
            <code className="bg-white px-2 py-1 rounded">
              {typeof window !== "undefined" ? window.location.origin : "https://nesreenmagazine.com"}
            </code>
          </div>
          <div>
            <strong>Response Format:</strong> JSON
          </div>
          <div>
            <strong>Autentifikasiya:</strong> Hər endpoint-in üzərində göstərilir. Qorunan endpoint-lər
            üçün <code className="bg-white px-1 rounded">Authorization: Bearer &lt;token&gt;</code> başlığı
            lazımdır.
          </div>
          <div className="text-muted-foreground">
            Bu səhifə yalnız sənədləşdirmə üçündür; brauzerdən test sorğusu göndərmək mümkün deyil.
          </div>
        </div>
      </div>

      {/* Endpoints by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Endpoints List */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 sticky top-4">
            <h2 className="font-bold mb-3">Endpoints</h2>

            {categories.map((category) => (
              <div key={category} className="mb-4">
                <div className="text-sm font-semibold text-muted-foreground mb-2">{category}</div>
                <div className="space-y-1">
                  {API_ENDPOINTS.filter((e) => e.category === category).map((endpoint) => (
                    <button
                      key={`${endpoint.method}-${endpoint.path}`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors ${
                        selectedEndpoint === endpoint ? "bg-primary/10 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded font-mono ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="text-xs font-mono truncate">{endpoint.path}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Endpoint Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEndpoint ? (
            <div className="border rounded-lg p-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded font-mono ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                {selectedEndpoint.auth ? (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">Auth tələb olunur</span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Açıq</span>
                )}
              </div>

              <p className="text-muted-foreground mb-4">{selectedEndpoint.description}</p>

              {selectedEndpoint.auth && (
                <p className="text-sm mb-4">
                  <strong>Autentifikasiya:</strong> {selectedEndpoint.auth}
                </p>
              )}

              {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Parametrlər</h3>
                  <div className="space-y-2">
                    {selectedEndpoint.parameters.map((param) => (
                      <div key={param.name} className="flex items-start gap-3 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{param.name}</code>
                        <span className="text-xs text-gray-500">{param.type}</span>
                        {param.required && <span className="text-xs text-red-600">məcburi</span>}
                        <span className="flex-1 text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEndpoint.requestBody && selectedEndpoint.requestBody.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Request Body (JSON)</h3>
                  <div className="space-y-2">
                    {selectedEndpoint.requestBody.map((field) => (
                      <div key={field.name} className="flex items-start gap-3 text-sm">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{field.name}</code>
                        <span className="text-xs text-gray-500">{field.type}</span>
                        {field.required && <span className="text-xs text-red-600">məcburi</span>}
                        <span className="flex-1 text-muted-foreground">{field.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Cavab nümunəsi</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                  {selectedEndpoint.responseExample}
                </pre>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-12 text-center text-muted-foreground">Endpoint seçin</div>
          )}
        </div>
      </div>

      {/* Status Codes */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">HTTP Status Kodları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { code: "200", name: "OK", desc: "Sorğu uğurla icra olundu", ok: true },
            { code: "400", name: "Bad Request", desc: "Yanlış və ya natamam parametrlər", ok: false },
            { code: "401", name: "Unauthorized", desc: "Token yoxdur və ya etibarsızdır", ok: false },
            { code: "500", name: "Server Error", desc: "Server xətası", ok: false },
            { code: "503", name: "Service Unavailable", desc: "Server konfiqurasiyası (məs. Firebase Admin açarı) çatışmır", ok: false },
          ].map((s) => (
            <div key={s.code}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-1 text-white rounded text-xs font-mono ${s.ok ? "bg-green-500" : "bg-red-500"}`}
                >
                  {s.code}
                </span>
                <span className="text-sm font-medium">{s.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
