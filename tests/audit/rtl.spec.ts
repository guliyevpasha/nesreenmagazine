import { test } from "@playwright/test";
import fs from "fs";

// ar: 375 və 1366 enində üfüqi scroll və güzgülənmə yoxlaması
const pages = [["home", "/ar"], ["article", "/ar/gundem/gundem-musahibe-designer"]];
const out: string[] = [];
for (const w of [375, 1366]) for (const [name, path] of pages) {
  test(`ar ${name} ${w}`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message.slice(0, 200)));
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(path, { waitUntil: "networkidle", timeout: 90000 });
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const wide = [...document.querySelectorAll("body *")].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > innerWidth + 1 || b.left < -1); }).slice(0, 5).map((e) => e.tagName + "." + String((e as HTMLElement).className).slice(0, 60));
      const cs = getComputedStyle(document.body);
      return { dir: de.dir, lang: de.lang, sw: de.scrollWidth, cw: de.clientWidth, bodyDir: cs.direction, textAlign: cs.textAlign, wide };
    });
    await page.screenshot({ path: `tests/audit/shots/ar-${name}-${w}.png`, fullPage: false });
    out.push(JSON.stringify({ name, w, ...r, errs }));
    fs.writeFileSync("tests/audit/rtl-result.json", "[" + out.join(",\n") + "]");
  });
}

// Konsol xətaları və hydration: hər dildə ana səhifə + məqalə
const res2: string[] = [];
for (const l of ["az", "en", "ru", "tr", "ar"]) for (const path of [`/${l}`, `/${l}/gundem/ben-affleck-yeniden-asiq-olmaga-hazirdir`, `/${l}/moda/copenhagen-kuce-modasi-7-qayda`, `/${l}/e-jurnal`, `/${l}/jurnallar`]) {
  test(`console ${path}`, async ({ page }) => {
    const errs: string[] = [];
    page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text().slice(0, 250)); });
    page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message.slice(0, 250)));
    await page.goto(path, { waitUntil: "networkidle", timeout: 90000 });
    res2.push(JSON.stringify({ path, final: new URL(page.url()).pathname, errs }));
    fs.writeFileSync("tests/audit/console-result.json", "[" + res2.join(",\n") + "]");
  });
}
