import { test, expect, ed, open, html, expectHtml, save, render, renderHtml, selectLine, pick, line, reloadKeep } from "./helpers";

/** Başlıq üslubu, mətn aralığı, girintilər və cədvəl düzülüşü. */
test.describe("Düzülüş funksiyaları", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("H1–H6 həqiqi başlıq elementləridir (font ölçüsü deyil)", async ({ page }) => {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      await line(page, `Başlıq səviyyə ${n}`, false);
      await page.getByTestId(`style-h${n}`).click();
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
    }
    for (const n of [1, 2, 3, 4, 5, 6]) {
      await expect(ed(page).locator(`h${n}`)).toHaveText(`Başlıq səviyyə ${n}`);
    }
    const out = await html(page);
    expect(out).not.toMatch(/font-size/);
    await save(page);
    for (const n of [1, 2, 3, 4, 5, 6]) await expect(render(page).locator(`h${n}`)).toHaveCount(1);
    await reloadKeep(page);
    for (const n of [1, 2, 3, 4, 5, 6]) await expect(ed(page).locator(`h${n}`)).toHaveCount(1);
  });

  test("başlıq səviyyəsinin fərdi üslubu bütün H2-lərə tətbiq olunur və yeni H2-yə də keçir", async ({ page }) => {
    await line(page, "Birinci H2", false);
    await page.getByTestId("style-h2").click();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await line(page, "adi mətn");
    await page.keyboard.type("İkinci H2");
    await page.getByTestId("style-h2").click();
    await pick(page, "tb-styles-menu", "heading-style-2");
    await page.getByTestId("style-font").selectOption({ label: "Georgia" });
    await page.getByTestId("style-size").fill("26");
    await page.getByTestId("style-save").click();
    await expect.poll(async () => ((await html(page)).match(/<h2[^>]*>.*?font-size: ?26pt/g) || []).length).toBe(2);
    await expect(ed(page).locator("p", { hasText: "adi mətn" }).locator("span[style*='26pt']")).toHaveCount(0);
    // yeni H2 avtomatik həmin üslubu alır
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Üçüncü H2");
    await page.getByTestId("style-h2").click();
    await expect.poll(async () => ((await html(page)).match(/<h2[^>]*>.*?font-size: ?26pt/g) || []).length).toBe(3);
    await save(page);
    await expect(render(page).locator("h2 span[style*='26pt']")).toHaveCount(3);
  });

  test("hərf və söz aralığı seçilmiş mətnə tətbiq olunur (hazır + xüsusi)", async ({ page }) => {
    await page.keyboard.type("aralıq sınağı mətni");
    await selectLine(page);
    await pick(page, "tb-textspacing", "ls-0.1em");
    await expectHtml(page, /letter-spacing: ?0\.1em/);
    await pick(page, "tb-textspacing", "ws-0.3em");
    await expectHtml(page, /word-spacing: ?0\.3em/);
    await page.getByTestId("tb-textspacing").click();
    await page.getByTestId("ls-input").fill("3");
    await page.getByTestId("ws-input").fill("12");
    await page.getByTestId("spacing-text-apply").click();
    await expectHtml(page, /letter-spacing: ?3px/);
    await expectHtml(page, /word-spacing: ?12px/);
    await save(page);
    expect(await renderHtml(page)).toMatch(/letter-spacing:3px/);
    expect(await renderHtml(page)).toMatch(/word-spacing:12px/);
    await pick(page, "tb-textspacing", "ls-normal");
    await pick(page, "tb-textspacing", "ws-normal");
    await expect.poll(() => html(page)).not.toMatch(/letter-spacing|word-spacing/);
  });

  test("ilk sətir, asılı girinti və Abzas parametrləri dialoqu", async ({ page }) => {
    await page.keyboard.type("Uzun abzas ".repeat(20));
    await pick(page, "tb-firstline", "fl-1.5");
    await expectHtml(page, /text-indent: ?1\.5em/);
    await pick(page, "tb-firstline", "fl--3");
    await expectHtml(page, /text-indent: ?-3em; ?padding-inline-start: ?3em/);
    await pick(page, "tb-firstline", "paragraph-dialog");
    await page.getByTestId("para-indent").fill("2");
    await page.getByTestId("para-special").selectOption("first");
    await page.getByTestId("para-by").fill("2");
    await page.getByTestId("spacing-line").fill("1.15");
    await page.getByTestId("spacing-before").fill("6");
    await page.getByTestId("spacing-after").fill("18");
    await page.getByTestId("spacing-apply").click();
    const out = await html(page);
    expect(out).toMatch(/margin-inline-start: ?4em/);
    expect(out).toMatch(/text-indent: ?2em/);
    expect(out).toMatch(/line-height: ?1\.15/);
    expect(out).toMatch(/margin-top: ?6pt/);
    expect(out).toMatch(/margin-bottom: ?18pt/);
    await save(page);
    const r = await renderHtml(page);
    for (const re of [/margin-inline-start:4em/, /text-indent:2em/, /line-height:1\.15/, /margin-top:6pt/, /margin-bottom:18pt/]) expect(r).toMatch(re);
    await reloadKeep(page);
    await expectHtml(page, /text-indent: ?2em/);
  });

  test("sətirlərarası və abzaslararası məsafə ayrı idarə olunur", async ({ page }) => {
    await page.keyboard.type("abzas");
    await pick(page, "tb-spacing", "lh-2.0");
    await expectHtml(page, /line-height: ?2/);
    await expect.poll(() => html(page)).not.toMatch(/margin-(top|bottom)/);
    await pick(page, "tb-spacing", "ps-Geniş");
    await expectHtml(page, /margin-top: ?12pt/);
    await expectHtml(page, /line-height: ?2/); // sətir aralığı dəyişmədi
  });

  test("cədvəl düzülüşü: hizalama, padding, spacing, sətir hündürlüyü, sütun eni, xana fonu/çərçivə", async ({ page }) => {
    await page.getByTestId("tab-insert").click();
    await pick(page, "tb-table", "table-cell-3x3");
    await expect(page.getByTestId("tab-table")).toBeVisible();
    await page.keyboard.type("A1");
    await pick(page, "tbl-align", "tbl-align-center");
    await pick(page, "tbl-padding", "tbl-pad-2");
    await pick(page, "tbl-spacing", "tbl-space-2");
    await page.getByTestId("tbl-row-height").fill("60");
    await page.getByTestId("tbl-col-width").fill("220");
    await page.getByTestId("tbl-size-apply").click();
    await pick(page, "tbl-cell-bg", "cell-bg-grid");
    await page.getByTestId("cell-bg-grid").locator('[data-color="#fef08a"]').click();
    await pick(page, "tbl-cell-border", "cell-border-bordo");
    await pick(page, "tbl-valign", "cell-valign-middle");
    const out = await html(page);
    for (const re of [/nm-talign-center/, /nm-tw-auto/, /nm-tpad-2/, /nm-tspace-2/, /height: ?60px/, /colwidth="220"/, /background-color/, /data-border="bordo"/, /vertical-align: ?middle/]) {
      expect(out, String(re)).toMatch(re);
    }
    await save(page);
    const r = await renderHtml(page);
    for (const re of [/nm-talign-center/, /nm-tpad-2/, /nm-tspace-2/, /height:60px/, /background-color/, /border:2px solid/, /vertical-align:middle/, /width:220px/]) {
      expect(r, String(re)).toMatch(re);
    }
    // CSS həqiqətən tətbiq olunur
    const cs = await render(page).locator("table").evaluate((t) => {
      const s = getComputedStyle(t);
      const td = getComputedStyle(t.querySelector("td,th")!);
      return { collapse: s.borderCollapse, spacing: s.borderSpacing, ml: s.marginLeft, pad: td.paddingTop };
    });
    expect(cs.collapse).toBe("separate");
    expect(cs.spacing).toContain("8px");
    expect(parseFloat(cs.ml)).toBeGreaterThan(0);
    expect(parseFloat(cs.pad)).toBeGreaterThan(10);
    await reloadKeep(page);
    await expectHtml(page, /nm-tpad-2/);
    await expectHtml(page, /height: ?60px/);
  });
});
