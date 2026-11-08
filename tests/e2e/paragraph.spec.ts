import { test, expect, ed, open, html, expectHtml, expectNoHtml, save, renderHtml, selectLine, pick, line } from "./helpers";

test.describe("Abzas qrupu", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("düzləndirmə: center/right/justify/left + aria-pressed", async ({ page }) => {
    await page.keyboard.type("Hizalama");
    for (const [id, v] of [["center", "center"], ["right", "right"], ["justify", "justify"]] as const) {
      await page.getByTestId(`tb-align-${id}`).click();
      await expect(page.getByTestId(`tb-align-${id}`)).toHaveAttribute("aria-pressed", "true");
      await expectHtml(page, `text-align: ${v}`);
    }
    await page.getByTestId("tb-align-left").click();
    await expect(page.getByTestId("tb-align-left")).toHaveAttribute("aria-pressed", "true");
    await save(page);
  });

  test("düzləndirmə render-də qalır", async ({ page }) => {
    await page.keyboard.type("Mərkəz");
    await page.getByTestId("tb-align-center").click();
    await save(page);
    expect(await renderHtml(page)).toMatch(/text-align: ?center/);
  });

  test("bullet siyahı: Enter yeni element, boş Enter çıxış", async ({ page }) => {
    await page.getByTestId("tb-bullets").click();
    await page.getByTestId("bullets-toggle").click();
    await line(page, "bir");
    await line(page, "iki");
    await page.keyboard.type("üç");
    await expect(ed(page).locator("ul > li")).toHaveCount(3);
    await page.keyboard.press("Enter");
    await expect(ed(page).locator("ul > li")).toHaveCount(4);
    await page.keyboard.press("Enter"); // boş element → çıx
    await expect(ed(page).locator("ul > li")).toHaveCount(3);
    await page.keyboard.type("siyahıdan kənar");
    await expect(ed(page).locator("ul + p")).toHaveText("siyahıdan kənar");
  });

  test("nömrəli siyahı: ardıcıllıq, Tab alt səviyyə, Shift+Tab", async ({ page }) => {
    await page.getByTestId("tb-numbers").click();
    await page.getByTestId("numbers-toggle").click();
    await line(page, "a");
    await line(page, "b");
    await page.keyboard.press("Tab");
    await line(page, "b1");
    await page.keyboard.type("b2");
    await expect(ed(page).locator("ol ol > li")).toHaveCount(2);
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter");
    await page.keyboard.type("c");
    const items = await ed(page).locator("ol").first().locator("> li").allInnerTexts();
    expect(items.length).toBe(4);
    // CSS counter ardıcıllığı: ilk səviyyə 1,2,3
    const nums = await ed(page).locator("ol").first().locator("> li").evaluateAll((lis) =>
      lis.map((li) => getComputedStyle(li, "::marker").content + "|" + getComputedStyle(li).listStyleType));
    console.log("markers", nums);
    await expectHtml(page, /<ol[\s\S]*<ol[\s\S]*<\/ol>[\s\S]*<\/ol>/);
  });

  test("marker tipləri (bullet)", async ({ page }) => {
    await page.keyboard.type("m");
    for (const m of ["circle", "square", "disc"]) {
      await pick(page, "tb-bullets", `marker-${m}`);
      await expectHtml(page, new RegExp(`list-style-type: ${m}|data-marker="${m}"`));
    }
    await pick(page, "tb-bullets", "marker-null");
    await expect(ed(page).locator("ul")).toHaveCount(1);
  });

  test("nömrə tipləri (Shift ilə seçim)", async ({ page }) => {
    await line(page, "a");
    await page.keyboard.type("b");
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Control+Shift+End");
    for (const t of ["lower-alpha", "upper-alpha", "lower-roman", "upper-roman", "decimal"]) {
      await pick(page, "tb-numbers", `numbering-${t}`);
      await expectHtml(page, new RegExp(`list-style-type: ${t}|data-marker="${t}"`));
    }
    await save(page);
    expect(await renderHtml(page)).toMatch(/<ol/);
  });

  test("çoxsəviyyəli: sink/lift + ordered/bullets", async ({ page }) => {
    await pick(page, "tb-multilevel", "multi-ordered");
    await line(page, "x");
    await page.keyboard.type("y");
    await pick(page, "tb-multilevel", "multi-sink");
    await expect(ed(page).locator("ol ol")).toHaveCount(1);
    await pick(page, "tb-multilevel", "multi-lift");
    await expect(ed(page).locator("ol ol")).toHaveCount(0);
    await pick(page, "tb-multilevel", "multi-bullets");
    await expect(ed(page).locator("ul")).toHaveCount(1);
  });

  test("siyahı daxilində toolbar indent/outdent", async ({ page }) => {
    await pick(page, "tb-bullets", "bullets-toggle");
    await line(page, "a");
    await page.keyboard.type("b");
    await page.getByTestId("tb-indent").click();
    await expect(ed(page).locator("ul ul")).toHaveCount(1);
    await page.getByTestId("tb-outdent").click();
    await expect(ed(page).locator("ul ul")).toHaveCount(0);
  });

  test("abzas girintisi: indent/outdent", async ({ page }) => {
    await page.keyboard.type("Girinti");
    await page.getByTestId("tb-indent").click();
    await expectHtml(page, /margin-inline-start: 2em/);
    await page.getByTestId("tb-indent").click();
    await expectHtml(page, /margin-inline-start: 4em/);
    await page.getByTestId("tb-outdent").click();
    await expectHtml(page, /margin-inline-start: 2em/);
    await page.getByTestId("tb-outdent").click();
    await expectNoHtml(page, /margin-inline-start/);
    await page.getByTestId("tb-indent").click();
    await save(page);
    expect(await renderHtml(page)).toMatch(/margin-inline-start: ?2em/);
  });

  test("sətir aralığı", async ({ page }) => {
    await page.keyboard.type("Aralıq");
    for (const v of ["1.0", "1.5", "2.0", "3.0"]) {
      await pick(page, "tb-spacing", `lh-${v}`);
      await expectHtml(page, new RegExp(`line-height: ${v.replace(/.0$/, "")};`));
    }
    await save(page);
    expect(await renderHtml(page)).toMatch(/line-height: ?3/);
  });

  test("abzas aralığı presetləri və xüsusi dialoq", async ({ page }) => {
    await page.keyboard.type("Abzas");
    await pick(page, "tb-spacing", "ps-Açıq");
    await expectHtml(page, /margin-top: \d+(\.\d+)?pt/);
    await pick(page, "tb-spacing", "ps-Boşluqsuz");
    await expectHtml(page, /margin-bottom: 0(pt)?/);
    await page.getByTestId("tb-spacing").click();
    await page.getByTestId("spacing-custom").click();
    await expect(page.getByTestId("spacing-dialog")).toBeVisible();
    await page.getByTestId("spacing-line").fill("1.8");
    await page.getByTestId("spacing-before").fill("7");
    await page.getByTestId("spacing-after").fill("13");
    await page.getByTestId("spacing-apply").click();
    await expectHtml(page, /line-height: 1\.8/);
    await expectHtml(page, /margin-top: 7pt/);
    await expectHtml(page, /margin-bottom: 13pt/);
    await save(page);
    const r = await renderHtml(page);
    expect(r).toMatch(/margin-top: ?7pt/);
    expect(r).toMatch(/margin-bottom: ?13pt/);
  });

  test("abzas çərçivəsi", async ({ page }) => {
    await page.keyboard.type("Çərçivə");
    for (const b of ["bottom", "top", "left", "right", "box"]) {
      await pick(page, "tb-borders", `border-${b}`);
      await expectHtml(page, /border[^;"]*:[^;"]*(solid|\d)/);
    }
    await pick(page, "tb-borders", "border-topbottom");
    await expectHtml(page, /border-top/);
    await pick(page, "tb-borders", "border-null");
    await expectNoHtml(page, /border/);
    await pick(page, "tb-borders", "border-bottom");
    await expectHtml(page, /border-bottom/);
    await save(page);
    expect(await renderHtml(page)).toMatch(/border-bottom/);
  });

  test("abzas fonu (shading)", async ({ page }) => {
    await page.keyboard.type("Fon");
    await page.getByTestId("tb-shading").click();
    await page.getByTestId("shading-grid").locator("button[data-color]").nth(3).click();
    await expectHtml(page, /background-color/);
    await save(page);
    expect(await renderHtml(page)).toMatch(/background-color/);
    await page.getByTestId("tb-shading").click();
    await page.getByTestId("shading-grid").getByRole("button").first().click();
    await expectNoHtml(page, /background-color/);
  });

  test("formatlaşdırma işarələri ¶", async ({ page }) => {
    await line(page, "bir iki");
    await page.keyboard.type("üç");
    await page.getByTestId("tb-marks").click();
    await expect(page.getByTestId("tb-marks")).toHaveAttribute("aria-pressed", "true");
    await expect(ed(page)).toHaveClass(/nm-show-marks/);
    await expect(ed(page).locator(".nm-mark-para").first()).toBeAttached();
    await expect(ed(page).locator(".nm-mark-space").first()).toBeAttached();
    await expectNoHtml(page, /nm-mark|nm-show-marks/); // çıxışa sızmamalı
    await page.getByTestId("tb-marks").click();
    await expect(ed(page)).not.toHaveClass(/nm-show-marks/);
  });

  test("nömrə tipləri Ctrl+A ilə (AllSelection)", async ({ page }) => {
    await line(page, "a");
    await page.keyboard.type("b");
    await page.keyboard.press("Control+a");
    await pick(page, "tb-numbers", "numbering-lower-alpha");
    await expectHtml(page, /list-style-type: lower-alpha|data-marker="lower-alpha"/);
  });

  test("Ctrl+A + sort (AllSelection) xəta vermir və sıralayır", async ({ page }) => {
    for (const w of ["Banan", "Çiyələk", "Alma", "Ənar"]) await line(page, w, w !== "Ənar");
    await page.keyboard.press("Control+a");
    await pick(page, "tb-sort", "sort-asc");
    await expect.poll(async () => (await ed(page).locator("> p").allInnerTexts()).join(",")).toBe("Alma,Banan,Çiyələk,Ənar");
  });

  test("abzasların sıralanması A-Z / Z-A (Shift ilə seçim, az əlifba)", async ({ page }) => {
    for (const w of ["Banan", "Çiyələk", "Alma", "Ənar"]) await line(page, w, w !== "Ənar");
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Control+Shift+End");
    await pick(page, "tb-sort", "sort-asc");
    await expect.poll(async () => (await ed(page).locator("> p").allInnerTexts()).join(",")).toBe("Alma,Banan,Çiyələk,Ənar");
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Control+Shift+End");
    await pick(page, "tb-sort", "sort-desc");
    await expect.poll(async () => (await ed(page).locator("> p").allInnerTexts()).join(",")).toBe("Ənar,Çiyələk,Banan,Alma");
  });

  test("siyahı elementlərinin sıralanması (hər dəfə siyahıya klik)", async ({ page }) => {
    await pick(page, "tb-bullets", "bullets-toggle");
    for (const w of ["c", "a", "b"]) await line(page, w, w !== "b");
    await pick(page, "tb-sort", "sort-asc");
    await expect.poll(async () => (await ed(page).locator("ul > li").allInnerTexts()).join(",")).toBe("a,b,c");
    await ed(page).locator("ul > li").first().click();
    await pick(page, "tb-sort", "sort-desc");
    await expect.poll(async () => (await ed(page).locator("ul > li").allInnerTexts()).join(",")).toBe("c,b,a");
  });

  test("siyahı sortundan sonra kursor siyahıda qalır (ardıcıl sort)", async ({ page }) => {
    await pick(page, "tb-bullets", "bullets-toggle");
    for (const w of ["c", "a", "b"]) await line(page, w, w !== "b");
    await pick(page, "tb-sort", "sort-asc");
    await expect.poll(async () => (await ed(page).locator("ul > li").allInnerTexts()).join(",")).toBe("a,b,c");
    await pick(page, "tb-sort", "sort-desc");
    await expect.poll(async () => (await ed(page).locator("ul > li").allInnerTexts()).join(",")).toBe("c,b,a");
  });

  test("siyahı persistence", async ({ page }) => {
    await pick(page, "tb-numbers", "numbers-toggle");
    await line(page, "bir");
    await page.keyboard.press("Tab");
    await line(page, "iç");
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.type("iki");
    await save(page);
    await page.reload();
    await expect(ed(page).locator("ol ol > li")).toHaveCount(1);
    await expect(ed(page).locator("ol").first().locator("> li")).toHaveCount(2);
    expect(await html(page)).toContain("iç");
  });
});
