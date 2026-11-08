import { test, expect, ed, open, html, expectHtml, save, render, selectLine, pick, reloadKeep, line } from "./helpers";

const AZ = "Ə ə Ğ ğ İ ı Ö ö Ü ü Ş ş Ç ç";
const RU = "Привет, мир! Съешь ещё этих мягких французских булок.";
const TR = "İstanbul’da Şişli, Çankaya ve Ğ harfi: ığdır";
const EN = "The quick brown fox jumps over the lazy dog.";

test.describe("i18n", () => {
  test("AZ simvolları yazılır və formatlanır", async ({ page }) => {
    await open(page);
    await page.keyboard.type(AZ);
    await expect(ed(page)).toContainText(AZ);
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await page.getByTestId("tb-italic").click();
    await expect(ed(page).locator("strong em, em strong").first()).toHaveText(AZ);
  });

  test("AZ: upper/lower yerli qaydaya görə (i→İ, ı→I)", async ({ page }) => {
    await open(page, "az");
    await page.keyboard.type("iı ğüşöç");
    await selectLine(page);
    await pick(page, "tb-case", "case-upper");
    await expect(ed(page)).toContainText("İI ĞÜŞÖÇ");
    await selectLine(page);
    await pick(page, "tb-case", "case-lower");
    await expect(ed(page)).toContainText("iı ğüşöç");
    await page.keyboard.press("End");
    await line(page, "", true);
    await page.keyboard.type("İSTANBUL IŞIQ");
    await selectLine(page);
    await pick(page, "tb-case", "case-lower");
    await expect(ed(page)).toContainText("istanbul ışıq");
  });

  test("TR: upper/lower", async ({ page }) => {
    await open(page, "tr");
    await page.keyboard.type("iı");
    await selectLine(page);
    await pick(page, "tb-case", "case-upper");
    await expect(ed(page)).toContainText("İI");
  });

  test("EN: i → I (qeyri-türk)", async ({ page }) => {
    await open(page, "en");
    await page.keyboard.type("title");
    await selectLine(page);
    await pick(page, "tb-case", "case-upper");
    await expect(ed(page)).toContainText("TITLE");
    await selectLine(page);
    await pick(page, "tb-case", "case-title");
    await expect(ed(page)).toContainText("Title");
  });

  test("RU kirill: yazı, upper/lower, title", async ({ page }) => {
    await open(page, "ru");
    await page.keyboard.type(RU);
    await expect(ed(page)).toContainText(RU);
    await selectLine(page);
    await pick(page, "tb-case", "case-upper");
    await expect(ed(page)).toContainText(RU.toUpperCase());
    await selectLine(page);
    await pick(page, "tb-case", "case-lower");
    await expect(ed(page)).toContainText(RU.toLowerCase());
  });

  test("AR: redaktor dir=rtl, ərəb mətn, format", async ({ page }) => {
    await open(page, "ar");
    await expect(ed(page)).toHaveAttribute("dir", "rtl");
    await page.keyboard.type("مرحبا بالعالم");
    await expect(ed(page)).toContainText("مرحبا بالعالم");
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await expectHtml(page, /<strong>مرحبا بالعالم<\/strong>/);
    await expect(ed(page)).toHaveCSS("direction", "rtl");
    await save(page);
    await expect(render(page)).toHaveAttribute("dir", "rtl");
  });

  test("AR: siyahı/indent RTL-də margin-inline-start işləyir", async ({ page }) => {
    await open(page, "ar");
    await page.keyboard.type("سطر");
    await page.getByTestId("tb-indent").click();
    const ml = await ed(page).locator("p").first().evaluate((p) => { const cs = getComputedStyle(p); return { l: cs.marginLeft, r: cs.marginRight }; });
    expect(parseFloat(ml.r), JSON.stringify(ml)).toBeGreaterThan(parseFloat(ml.l));
  });

  test("save + reload bütün dillərdə dəqiq simvolları saxlayır", async ({ page }) => {
    await open(page, "az");
    const all: [string, string][] = [["az", AZ], ["ru", RU], ["tr", TR], ["en", EN], ["ar", "مرحبا بالعالم ٣٢١"]];
    for (const [loc, text] of all) {
      await open(page, loc);
      await page.keyboard.type(text);
      await save(page);
      await reloadKeep(page);
      await expect(page.getByTestId("harness-locale")).toHaveValue(loc);
      await expect(ed(page)).toHaveText(text);
      await expect(render(page)).toContainText(text);
      expect(await html(page)).toContain(text);
    }
  });

  test("qarışıq dil sətri (AZ + RU + AR) bir abzasda saxlanır", async ({ page }) => {
    await open(page);
    const mix = "Salam Привет مرحبا Ə";
    await page.keyboard.type(mix);
    await save(page);
    await reloadKeep(page);
    await expect(ed(page)).toHaveText(mix);
  });
});
