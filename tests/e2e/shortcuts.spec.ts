import { test, expect, ed, open, html, expectHtml, expectNoHtml, selectLine, pick, line } from "./helpers";

test.describe("Qısayollar", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("Ctrl+B / I / U seçimə tətbiq edir və toolbar ilə eyni nəticə verir", async ({ page }) => {
    await page.keyboard.type("kısayol");
    await selectLine(page);
    await page.keyboard.press("Control+b");
    await page.keyboard.press("Control+i");
    await page.keyboard.press("Control+u");
    await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("tb-italic")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("tb-underline")).toHaveAttribute("aria-pressed", "true");
    const viaKeys = await html(page);
    expect(viaKeys).toMatch(/<strong>/);
    expect(viaKeys).toMatch(/<em>/);
    expect(viaKeys).toMatch(/<u>/);
    // toolbar ilə: söndür, sonra düymələrlə yandır və eyni HTML
    await page.getByTestId("tb-bold").click();
    await page.getByTestId("tb-italic").click();
    await page.getByTestId("tb-underline").click();
    await expectNoHtml(page, /<(strong|em|u)>/);
    await page.getByTestId("tb-bold").click();
    await page.getByTestId("tb-italic").click();
    await page.getByTestId("tb-underline").click();
    expect(await html(page)).toBe(viaKeys);
  });

  test("Ctrl+Z / Ctrl+Y (və Ctrl+Shift+Z)", async ({ page }) => {
    await page.keyboard.type("birinci");
    await page.waitForTimeout(600);
    await page.keyboard.press("Control+b");
    await page.keyboard.type(" qalın");
    await page.waitForTimeout(600);
    await page.keyboard.press("Control+z");
    await expect(ed(page)).not.toContainText("qalın");
    await page.keyboard.press("Control+y");
    await expect(ed(page)).toContainText("qalın");
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+Shift+Z");
    await expect(ed(page)).toContainText("qalın");
  });

  test("Ctrl+K link dialoqu açır", async ({ page }) => {
    await page.keyboard.type("link");
    await selectLine(page);
    await page.keyboard.press("Control+k");
    await expect(page.getByTestId("link-dialog")).toBeVisible();
    await page.getByTestId("link-url").fill("https://example.com");
    await page.getByTestId("link-apply").click();
    await expectHtml(page, /<a [^>]*href="https:\/\/example\.com"/);
  });

  test("Ctrl+Shift+7 nömrəli, Ctrl+Shift+L markerli siyahı, Ctrl+Shift+8 işarələr (bullet deyil)", async ({ page }) => {
    await page.keyboard.type("x");
    await page.keyboard.press("Control+Shift+7");
    await expect(ed(page).locator("ol")).toHaveCount(1);
    await page.keyboard.press("Control+Shift+7");
    await expect(ed(page).locator("ol")).toHaveCount(0);
    await page.keyboard.press("Control+Shift+L");
    await expect(ed(page).locator("ul")).toHaveCount(1);
    await page.keyboard.press("Control+Shift+L");
    await expect(ed(page).locator("ul")).toHaveCount(0);
    await page.keyboard.press("Control+Shift+8");
    await expect(ed(page)).toHaveClass(/nm-show-marks/);
    await expect(ed(page).locator("ul")).toHaveCount(0);
    await expect(page.getByTestId("tb-marks")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Control+Shift+8");
    await expect(ed(page)).not.toHaveClass(/nm-show-marks/);
  });

  test("Ctrl+C / Ctrl+X / Ctrl+V redaktor daxilində", async ({ page }) => {
    await page.keyboard.type("kopya");
    await selectLine(page);
    await page.keyboard.press("Control+b");
    await page.keyboard.press("Control+c");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Control+v");
    await expect(ed(page).locator("p")).toHaveCount(2);
    await expect(ed(page).locator("p").nth(1)).toHaveText("kopya");
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.keyboard.press("Control+x");
    await expect(ed(page).locator("p").nth(1)).toHaveText("");
    await page.keyboard.press("Control+v");
    await expect(ed(page).locator("p").nth(1)).toHaveText("kopya");
    // format qorunur
    await expect(ed(page).locator("p").nth(1).locator("strong")).toHaveCount(1);
  });

  test("toolbar Kopyala/Kəs/Yapışdır", async ({ page }) => {
    await page.keyboard.type("alət");
    await selectLine(page);
    await page.getByTestId("tb-copy").click();
    await page.keyboard.press("End");
    await page.getByTestId("tb-paste").click();
    await expect(ed(page)).toContainText("alətalət");
    await page.keyboard.press("Control+a");
    await page.getByTestId("tb-cut").click();
    await expect(ed(page)).toHaveText("");
    await page.getByTestId("tb-paste").click();
    await expect(ed(page)).toContainText("alətalət");
  });

  test("Tab / Shift+Tab siyahıda", async ({ page }) => {
    await page.keyboard.press("Control+Shift+L");
    await line(page, "a");
    await page.keyboard.type("b");
    await page.keyboard.press("Tab");
    await expect(ed(page).locator("ul ul > li")).toHaveCount(1);
    await page.keyboard.press("Shift+Tab");
    await expect(ed(page).locator("ul ul")).toHaveCount(0);
  });

  test("Ctrl+E / R / L / J hizalama", async ({ page }) => {
    await page.keyboard.type("hiza");
    const cases: [string, string, string][] = [["Control+e", "center", "tb-align-center"], ["Control+r", "right", "tb-align-right"], ["Control+j", "justify", "tb-align-justify"], ["Control+l", "left", "tb-align-left"]];
    for (const [k, v, id] of cases) {
      await page.keyboard.press(k);
      await expect(page.getByTestId(id), k).toHaveAttribute("aria-pressed", "true");
      if (v !== "left") await expectHtml(page, `text-align: ${v}`);
    }
  });

  test("Ctrl+] / Ctrl+[ şrift ölçüsü (toolbar ilə eyni)", async ({ page }) => {
    await page.keyboard.type("ölçü");
    await selectLine(page);
    const size = async () => Number(((await html(page)).match(/font-size: ([\d.]+)pt/) || [])[1] || 0);
    await page.keyboard.press("Control+]");
    await expect.poll(size).toBeGreaterThan(0);
    const s1 = await size();
    await page.keyboard.press("Control+]");
    await expect.poll(size).toBeGreaterThan(s1);
    const s2 = await size();
    await page.keyboard.press("Control+[");
    await expect.poll(size).toBeLessThan(s2);
    // toolbar ilə müqayisə: düymə də eyni addımı atmalıdır
    const before = await size();
    await page.getByTestId("tb-grow").click();
    await expect.poll(size).toBeGreaterThan(before);
    void pick;
  });
});
