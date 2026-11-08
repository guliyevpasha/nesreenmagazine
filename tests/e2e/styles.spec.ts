import { test, expect, openMenu, ed, open, html, expectHtml, save, render, renderHtml, selectLine, pick, line, pasteHtml, reloadKeep } from "./helpers";

test.describe("Üslublar", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  const map: [string, string][] = [
    ["style-h1", "h2"], ["style-h2", "h3"], ["style-h3", "h4"], ["style-h4", "h5"],
    ["style-quote", "blockquote"],
  ];
  for (const [id, tag] of map) {
    test(`${id} → <${tag}>`, async ({ page }) => {
      await page.keyboard.type("Üslub mətni");
      await page.getByTestId(id).click();
      await expect(ed(page).locator(tag)).toHaveText("Üslub mətni");
      await expect(page.getByTestId(id)).toHaveAttribute("aria-pressed", "true");
      await expectHtml(page, new RegExp(`<${tag}[ >]`));
      expect(await html(page)).not.toMatch(/<h1/);
      await save(page);
      expect(await renderHtml(page)).toMatch(new RegExp(`<${tag}[ >]`));
    });
  }

  test("title / subtitle / nospacing / intense → sinif", async ({ page }) => {
    for (const k of ["title", "subtitle", "nospacing"]) {
      await page.keyboard.type("T-" + k);
      await page.getByTestId(`style-${k}`).click();
      await expectHtml(page, new RegExp(`<p[^>]*(nm-s-${k}|data-style="${k}")`));
      await page.keyboard.press("Enter");
      await page.getByTestId("style-normal").click();
    }
    await page.keyboard.type("Intense");
    await page.getByTestId("style-intense").click();
    await expectHtml(page, /<blockquote[^>]*nm-s-intense/);
    await save(page);
    const r = await renderHtml(page);
    expect(r).toMatch(/nm-s-title|data-style="title"/);
    expect(r).toMatch(/nm-s-intense/);
  });

  test("üslub dəyişəndə mətn qalır, normal geri qaytarır", async ({ page }) => {
    await page.keyboard.type("Saxla məni");
    for (const k of ["h1", "title", "quote", "h3", "intense", "subtitle", "h2", "normal"]) {
      await page.getByTestId(`style-${k}`).click();
      await expect(ed(page)).toContainText("Saxla məni");
      await expect(page.getByTestId(`style-${k}`)).toHaveAttribute("aria-pressed", "true");
    }
    await expect(ed(page).locator("h2,h3,h4,h5,blockquote")).toHaveCount(0);
    expect((await html(page)).replace(/<[^>]+>/g, "").trim()).toBe("Saxla məni");
  });

  test("quote → heading: blockquote-dan çıxır", async ({ page }) => {
    await page.keyboard.type("Q");
    await page.getByTestId("style-quote").click();
    await page.getByTestId("style-h1").click();
    await expect(ed(page).locator("blockquote")).toHaveCount(0);
    await expect(ed(page).locator("h2")).toHaveText("Q");
  });

  test("TOC: H2/H3 siyahıda, h1 yoxdur", async ({ page }) => {
    await page.keyboard.type("Birinci bölmə");
    await page.getByTestId("style-h1").click();
    await page.keyboard.press("Enter");
    await line(page, "mətn");
    await page.keyboard.type("Alt bölmə");
    await page.getByTestId("style-h2").click();
    await save(page);
    const toc = await page.getByTestId("harness-toc").innerText();
    expect(toc).toContain("Birinci bölmə");
    expect(toc).toContain("Alt bölmə");
    expect(await renderHtml(page)).toMatch(/<h2[^>]*id=/);
  });

  test("xüsusi üslub: yarat, başqa abzasa tətbiq et, redaktə et → hamısına, reload", async ({ page }) => {
    await line(page, "Nümunə");
    await line(page, "Digər abzas");
    await page.keyboard.type("Üçüncü");
    await page.keyboard.press("Control+Home");
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await pick(page, "tb-font-size", "size-22");
    await openMenu(page, "tb-styles-menu");
    await page.getByTestId("style-create").click();
    await expect(page.getByTestId("style-dialog")).toBeVisible();
    await page.getByTestId("style-name").fill("Mənim");
    await page.getByTestId("style-save").click();
    await expect(page.getByTestId("custom-style-Mənim")).toBeVisible();
    // 2-ci və 3-cü abzasa tətbiq
    await page.keyboard.press("ArrowDown");
    await page.getByTestId("custom-style-Mənim").click();
    await page.keyboard.press("ArrowDown");
    await page.getByTestId("custom-style-Mənim").click();
    await expect(ed(page).locator("[data-style], [data-custom-style]").first()).toBeAttached();
    const h1 = await html(page);
    expect((h1.match(/data-style="s-/g) || []).length, h1).toBe(3);
    await expect(page.getByTestId("custom-style-Mənim")).toHaveAttribute("aria-pressed", "true");
    // redaktə → ölçü 12 → hamısına tətbiq olunur
    await openMenu(page, "tb-styles-menu");
    await page.getByTestId("style-edit-Mənim").click();
    await page.getByTestId("style-size").fill("12");
    await page.getByTestId("style-save").click();
    await expect.poll(async () => (await html(page)).match(/font-size: 12pt/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    // persist
    await save(page);
    await reloadKeep(page);
    await expect(page.getByTestId("custom-style-Mənim")).toBeVisible();
    expect((await html(page)).match(/font-size: 12pt/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(await renderHtml(page)).toMatch(/font-size: ?12pt/);
  });

  test("SEO: yapışdırılan <h1> çıxışda yoxdur", async ({ page }) => {
    await pasteHtml(page, "<h1>Böyük başlıq</h1><p>mətn</p>");
    await expect(ed(page)).toContainText("Böyük başlıq");
    await page.waitForTimeout(500);
    expect(await html(page)).not.toMatch(/<h1/i);
    await save(page);
    expect(await renderHtml(page)).not.toMatch(/<h1/i);
    await expect(render(page)).toContainText("Böyük başlıq");
  });

  test("SEO: server sanitizatoru xam <h1> mənbəsini h2-yə çevirir (localStorage inject)", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("nm-editor-harness", JSON.stringify({ html: "<h1>Raw</h1><p>x</p>", locale: "az" })));
    await page.reload();
    await expect(ed(page)).toContainText("Raw");
    expect(await ed(page).innerHTML()).not.toMatch(/<h1/i);
    await save(page);
    await expect(render(page).locator("h1")).toHaveCount(0);
  });
});
