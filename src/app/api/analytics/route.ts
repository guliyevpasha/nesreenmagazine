import { NextRequest, NextResponse } from "next/server";

// Google Analytics Data API v1
// https://developers.google.com/analytics/devguides/reporting/data/v1

interface GA4Request {
  range: string;
  start?: string;
  end?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "30days";
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // Google Analytics Property ID
    const propertyId = process.env.GA4_PROPERTY_ID;
    const credentials = process.env.GA4_SERVICE_ACCOUNT_KEY;

    if (!propertyId || !credentials) {
      return NextResponse.json(
        { error: "Google Analytics konfiqurasiyası tapılmadı" },
        { status: 500 }
      );
    }

    // Tarix aralığını hesabla
    const { startDate, endDate } = getDateRange(range, start, end);

    // Google Analytics Data API çağırışları
    const [
      overviewData,
      languageData,
      demographicData,
      geoData,
      trafficData,
      contentData,
      keywordData,
    ] = await Promise.all([
      fetchOverviewMetrics(propertyId, startDate, endDate),
      fetchLanguageStats(propertyId, startDate, endDate),
      fetchDemographics(propertyId, startDate, endDate),
      fetchGeoData(propertyId, startDate, endDate),
      fetchTrafficSources(propertyId, startDate, endDate),
      fetchTopContent(propertyId, startDate, endDate),
      fetchSearchKeywords(propertyId, startDate, endDate),
    ]);

    return NextResponse.json({
      ...overviewData,
      byLanguage: languageData,
      byAge: demographicData.age,
      byGender: demographicData.gender,
      byCountry: geoData.countries,
      byCity: geoData.cities,
      bySources: trafficData,
      topArticles: contentData.articles,
      byTags: contentData.tags,
      byKeywords: keywordData,
      internalLinks: contentData.internalLinks,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Statistika yüklənmədi", details: error instanceof Error ? error.message : "" },
      { status: 500 }
    );
  }
}

function getDateRange(range: string, customStart?: string | null, customEnd?: string | null) {
  const today = new Date();
  let startDate: string;
  const endDate = today.toISOString().split("T")[0];

  if (range === "custom" && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  switch (range) {
    case "today":
      startDate = endDate;
      break;
    case "7days":
      startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split("T")[0];
      break;
    case "30days":
      startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0];
      break;
    case "90days":
      startDate = new Date(today.setDate(today.getDate() - 90)).toISOString().split("T")[0];
      break;
    case "180days":
      startDate = new Date(today.setDate(today.getDate() - 180)).toISOString().split("T")[0];
      break;
    case "365days":
      startDate = new Date(today.setDate(today.getDate() - 365)).toISOString().split("T")[0];
      break;
    default:
      startDate = new Date(today.setDate(today.getDate() - 30)).toISOString().split("T")[0];
  }

  return { startDate, endDate };
}

async function fetchOverviewMetrics(propertyId: string, startDate: string, endDate: string) {
  // GA4 Data API request
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GA4 API error: ${response.statusText}`);
  }

  const data = await response.json();
  const row = data.rows?.[0]?.metricValues || [];

  return {
    totalVisitors: parseInt(row[0]?.value || "0"),
    pageViews: parseInt(row[1]?.value || "0"),
    avgSessionDuration: formatDuration(parseFloat(row[2]?.value || "0")),
    bounceRate: `${(parseFloat(row[3]?.value || "0") * 100).toFixed(1)}%`,
  };
}

async function fetchLanguageStats(propertyId: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "customEvent:locale" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    }
  );

  const data = await response.json();
  const total = data.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0].value), 0) || 1;

  return (
    data.rows?.map((row: any) => ({
      locale: row.dimensionValues[0].value,
      visitors: parseInt(row.metricValues[0].value),
      pageviews: parseInt(row.metricValues[1].value),
      percentage: `${((parseInt(row.metricValues[0].value) / total) * 100).toFixed(1)}%`,
    })) || []
  );
}

async function fetchDemographics(propertyId: string, startDate: string, endDate: string) {
  const [ageData, genderData] = await Promise.all([
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "userAgeBracket" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
    }).then((r) => r.json()),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "userGender" }],
        metrics: [{ name: "activeUsers" }],
      }),
    }).then((r) => r.json()),
  ]);

  const totalAge = ageData.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0].value), 0) || 1;
  const totalGender = genderData.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0].value), 0) || 1;

  const genderMap: Record<string, string> = {
    male: "Kişi",
    female: "Qadın",
    unknown: "Məlum deyil",
  };

  return {
    age:
      ageData.rows?.map((row: any) => ({
        range: row.dimensionValues[0].value,
        visitors: parseInt(row.metricValues[0].value),
        percentage: `${((parseInt(row.metricValues[0].value) / totalAge) * 100).toFixed(1)}%`,
      })) || [],
    gender:
      genderData.rows?.map((row: any) => ({
        gender: genderMap[row.dimensionValues[0].value] || row.dimensionValues[0].value,
        visitors: parseInt(row.metricValues[0].value),
        percentage: `${((parseInt(row.metricValues[0].value) / totalGender) * 100).toFixed(1)}%`,
      })) || [],
  };
}

async function fetchGeoData(propertyId: string, startDate: string, endDate: string) {
  const [countryData, cityData] = await Promise.all([
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
    }).then((r) => r.json()),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "city" }, { name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 5,
      }),
    }).then((r) => r.json()),
  ]);

  const totalCountry = countryData.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0].value), 0) || 1;

  return {
    countries:
      countryData.rows?.map((row: any) => ({
        country: row.dimensionValues[0].value,
        visitors: parseInt(row.metricValues[0].value),
        percentage: `${((parseInt(row.metricValues[0].value) / totalCountry) * 100).toFixed(1)}%`,
      })) || [],
    cities:
      cityData.rows?.map((row: any) => ({
        city: row.dimensionValues[0].value,
        country: row.dimensionValues[1].value,
        visitors: parseInt(row.metricValues[0].value),
      })) || [],
  };
}

async function fetchTrafficSources(propertyId: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
    }
  );

  const data = await response.json();
  const total = data.rows?.reduce((sum: number, row: any) => sum + parseInt(row.metricValues[0].value), 0) || 1;

  return (
    data.rows?.map((row: any) => ({
      source: row.dimensionValues[0].value,
      visitors: parseInt(row.metricValues[0].value),
      percentage: `${((parseInt(row.metricValues[0].value) / total) * 100).toFixed(1)}%`,
    })) || []
  );
}

async function fetchTopContent(propertyId: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pageTitle" }, { name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
    }
  );

  const data = await response.json();

  return {
    articles:
      data.rows
        ?.filter((row: any) => !row.dimensionValues[1].value.includes("/admin"))
        .map((row: any) => {
          const path = row.dimensionValues[1].value;
          const locale = path.split("/")[1] || "az";
          const slug = path.split("/").pop() || "";
          return {
            title: row.dimensionValues[0].value,
            slug,
            views: parseInt(row.metricValues[0].value),
            locale,
          };
        }) || [],
    tags: [], // Firestore-dan tag məlumatları əlavə ediləcək
    internalLinks: {
      clickRate: "0%", // Event tracking ilə hesablanacaq
      topLinks: [],
    },
  };
}

async function fetchSearchKeywords(propertyId: string, startDate: string, endDate: string) {
  // Google Search Console API ilə inteqrasiya
  // Bu hissə Search Console API key lazım olduğu üçün demo məlumat qaytarır
  return [];
}

async function getAccessToken(): Promise<string> {
  // Service Account credentials ilə JWT token alınır
  const credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_KEY || "{}");
  
  // JWT yaradılması və token mübadiləsi
  // Bu sadələşdirilmiş nümunədir - real həyatda googleapis paketi istifadə edilir
  
  return "demo_token"; // Real token alınacaq
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
