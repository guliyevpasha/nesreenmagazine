"use client";

import { useState } from "react";

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  auth: boolean;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: { field: string; type: string; required: boolean; description: string }[];
  responseExample: string;
  category: string;
};

const API_ENDPOINTS: ApiEndpoint[] = [
  // Analytics
  {
    method: "GET",
    path: "/api/analytics",
    description: "Sayt analitika məlumatlarını əldə et",
    auth: false,
    parameters: [
      { name: "period", type: "string", required: false, description: "Dövr: 'day', 'week', 'month'" },
      { name: "category", type: "string", required: false, description: "Kateqoriya filteri" },
    ],
    responseExample: `{
  "pageViews": 12543,
  "uniqueVisitors": 8234,
  "topArticles": [
    {
      "id": "article-1",
      "title": "Bahar moda trendləri",
      "views": 1234
    }
  ],
  "byCategory": {
    "moda": 4532,
    "yasam": 3421
  }
}`,
    category: "Analytics",
  },
  {
    method: "GET",
    path: "/api/seo/analytics",
    description: "SEO analitika məlumatları",
    auth: false,
    parameters: [
      { name: "url", type: "string", required: false, description: "Spesifik URL üçün analitika" },
    ],
    responseExample: `{
  "totalPages": 523,
  "indexed": 487,
  "seoScore": 85,
  "issues": [
    {
      "type": "missing_meta",
      "count": 12,
      "severity": "medium"
    }
  ]
}`,
    category: "SEO",
  },
  // Upload
  {
    method: "POST",
    path: "/api/upload",
    description: "Fayl yükləmə (şəkil, PDF və s.)",
    auth: true,
    requestBody: [
      { field: "file", type: "File", required: true, description: "Yükləniləcək fayl" },
      { field: "folder", type: "string", required: false, description: "Hədəf qovluq" },
    ],
    responseExample: `{
  "success": true,
  "url": "https://storage.firebase.com/...",
  "path": "/uploads/2026/10/image.jpg",
  "size": 245678,
  "mimeType": "image/jpeg"
}`,
    category: "Upload",
  },
];

// Hypothetical future endpoints for documentation
const FUTURE_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/articles",
    description: "Məqalələri siyahıla",
    auth: false,
    parameters: [
      { name: "category", type: "string", required: false, description: "Kateqoriya filteri" },
      { name: "locale", type: "string", required: false, description: "Dil: az, en, ru, tr, ar" },
      { name: "limit", type: "number", required: false, description: "Nəticə sayı (default: 20)" },
      { name: "offset", type: "number", required: false, description: "Başlanğıc index" },
    ],
    responseExample: `{
  "articles": [
    {
      "id": "abc123",
      "slug": "bahar-moda",
      "title": "Bahar moda trendləri",
      "excerpt": "Bu mövsüm ən çox...",
      "coverImage": "https://...",
      "category": "moda",
      "publishedAt": "2026-10-15T10:00:00Z"
    }
  ],
  "total": 523,
  "hasMore": true
}`,
    category: "Articles",
  },
  {
    method: "GET",
    path: "/api/articles/:id",
    description: "Tək məqalə detalları",
    auth: false,
    parameters: [
      { name: "id", type: "string", required: true, description: "Məqalə ID" },
      { name: "locale", type: "string", required: false, description: "Dil" },
    ],
    responseExample: `{
  "id": "abc123",
  "slug": "bahar-moda",
  "title": "Bahar moda trendləri",
  "body": "Tam mətn...",
  "author": "Nesreen",
  "tags": ["moda", "trend", "bahar"],
  "views": 1234
}`,
    category: "Articles",
  },
  {
    method: "POST",
    path: "/api/comments",
    description: "Şərh əlavə et",
    auth: false,
    requestBody: [
      { field: "articleId", type: "string", required: true, description: "Məqalə ID" },
      { field: "userName", type: "string", required: true, description: "İstifadəçi adı" },
      { field: "email", type: "string", required: true, description: "Email" },
      { field: "content", type: "string", required: true, description: "Şərh mətni" },
    ],
    responseExample: `{
  "success": true,
  "commentId": "comment-xyz",
  "status": "pending",
  "message": "Şərhiniz moderasiyaya göndərildi"
}`,
    category: "Comments",
  },
  {
    method: "POST",
    path: "/api/newsletter/subscribe",
    description: "Newsletter-ə abunə ol",
    auth: false,
    requestBody: [
      { field: "email", type: "string", required: true, description: "Email ünvanı" },
      { field: "name", type: "string", required: false, description: "Ad" },
    ],
    responseExample: `{
  "success": true,
  "message": "Abunəlik uğurla tamamlandı"
}`,
    category: "Newsletter",
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testMethod, setTestMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("GET");
  const [testUrl, setTestUrl] = useState("");
  const [testBody, setTestBody] = useState("{}");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const allEndpoints = [...API_ENDPOINTS, ...FUTURE_ENDPOINTS];
  const categories = Array.from(new Set(allEndpoints.map((e) => e.category)));

  async function handleTestApi() {
    if (!testUrl) return;

    setIsTesting(true);
    setTestResponse("");

    try {
      const options: RequestInit = {
        method: testMethod,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (testMethod === "POST" && testBody) {
        options.body = testBody;
      }

      const response = await fetch(testUrl, options);
      const data = await response.json();

      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setTestResponse(`Error: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  }

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
          NESREEN Magazine REST API endpoint-ləri və istifadə qaydaları
        </p>
      </div>

      {/* API Info */}
      <div className="border rounded-lg p-6 bg-blue-50">
        <h2 className="text-lg font-bold mb-3">📋 Əsas Məlumat</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Base URL:</strong> <code className="bg-white px-2 py-1 rounded">{typeof window !== "undefined" ? window.location.origin : "https://nesreenmagazine.com"}</code>
          </div>
          <div>
            <strong>Response Format:</strong> JSON
          </div>
          <div>
            <strong>Authentication:</strong> Bearer Token (Firebase Auth)
          </div>
          <div>
            <strong>Rate Limiting:</strong> 100 requests / minute
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
                <div className="text-sm font-semibold text-muted-foreground mb-2">
                  {category}
                </div>
                <div className="space-y-1">
                  {allEndpoints
                    .filter((e) => e.category === category)
                    .map((endpoint, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedEndpoint(endpoint);
                          setTestUrl(endpoint.path);
                          setTestMethod(endpoint.method);
                        }}
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
            <>
              {/* Endpoint Info */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded font-mono ${getMethodColor(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-lg font-mono">{selectedEndpoint.path}</code>
                  {selectedEndpoint.auth && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                      🔒 Auth Required
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{selectedEndpoint.description}</p>

                {/* Parameters */}
                {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Query Parameters</h3>
                    <div className="space-y-2">
                      {selectedEndpoint.parameters.map((param, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {param.name}
                          </code>
                          <span className="text-xs text-gray-500">{param.type}</span>
                          {param.required && (
                            <span className="text-xs text-red-600">required</span>
                          )}
                          <span className="flex-1 text-muted-foreground">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {selectedEndpoint.requestBody && selectedEndpoint.requestBody.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Request Body</h3>
                    <div className="space-y-2">
                      {selectedEndpoint.requestBody.map((field, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                            {field.field}
                          </code>
                          <span className="text-xs text-gray-500">{field.type}</span>
                          {field.required && (
                            <span className="text-xs text-red-600">required</span>
                          )}
                          <span className="flex-1 text-muted-foreground">{field.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Example */}
                <div>
                  <h3 className="font-semibold mb-2">Response Example</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                    {selectedEndpoint.responseExample}
                  </pre>
                </div>
              </div>

              {/* API Tester */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h2 className="text-lg font-bold mb-4">🧪 API Test Paneli</h2>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <select
                      value={testMethod}
                      onChange={(e) => setTestMethod(e.target.value as any)}
                      className="px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>

                    <input
                      type="text"
                      placeholder="API URL"
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />

                    <button
                      onClick={handleTestApi}
                      disabled={isTesting}
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isTesting ? "Testing..." : "Test"}
                    </button>
                  </div>

                  {(testMethod === "POST" || testMethod === "PUT") && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Request Body (JSON)</label>
                      <textarea
                        value={testBody}
                        onChange={(e) => setTestBody(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                        placeholder='{"key": "value"}'
                      />
                    </div>
                  )}

                  {testResponse && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Response</label>
                      <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                        {testResponse}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="border rounded-lg p-12 text-center text-muted-foreground">
              Endpoint seçin
            </div>
          )}
        </div>
      </div>

      {/* Status Codes */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">HTTP Status Kodları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-mono">200</span>
              <span className="text-sm font-medium">OK</span>
            </div>
            <p className="text-xs text-muted-foreground">Sorğu uğurla icra olundu</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-green-500 text-white rounded text-xs font-mono">201</span>
              <span className="text-sm font-medium">Created</span>
            </div>
            <p className="text-xs text-muted-foreground">Yeni resurs yaradıldı</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">400</span>
              <span className="text-sm font-medium">Bad Request</span>
            </div>
            <p className="text-xs text-muted-foreground">Yanlış sorğu formatı</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">401</span>
              <span className="text-sm font-medium">Unauthorized</span>
            </div>
            <p className="text-xs text-muted-foreground">Autentifikasiya tələb olunur</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">404</span>
              <span className="text-sm font-medium">Not Found</span>
            </div>
            <p className="text-xs text-muted-foreground">Resurs tapılmadı</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-mono">500</span>
              <span className="text-sm font-medium">Server Error</span>
            </div>
            <p className="text-xs text-muted-foreground">Server xətası</p>
          </div>
        </div>
      </div>
    </div>
  );
}
