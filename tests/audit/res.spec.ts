import { test } from "@playwright/test";
test("failed resources", async ({ page }) => {
  const bad: string[] = [];
  page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url().slice(0, 200)); });
  for (const p of ["/az/moda/copenhagen-kuce-modasi-7-qayda", "/ar/gundem/ben-affleck-yeniden-asiq-olmaga-hazirdir"]) { await page.goto(p, { waitUntil: "networkidle" }); }
  console.log(bad.join("\n"));
});
