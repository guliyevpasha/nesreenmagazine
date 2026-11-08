import { test, expect, ed, open, html, expectHtml } from "./helpers";

const VPS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "375x812", width: 375, height: 812 },
];

for (const vp of VPS) {
  test.describe(`viewport ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.width < 800 });

    test("ribbon görünür, üfüqi scroll yoxdur", async ({ page }) => {
      await open(page);
      await expect(page.getByTestId("tab-home")).toBeVisible();
      await expect(page.getByTestId("ribbon-home")).toBeVisible();
      await expect(page.getByTestId("tb-bold")).toBeVisible();
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, bw: document.body.scrollWidth }));
      expect(m.sw, JSON.stringify(m)).toBeLessThanOrEqual(m.iw + 1);
      await page.getByTestId("tab-insert").click();
      await expect(page.getByTestId("tb-link")).toBeVisible();
      const m2 = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      expect(m2.sw, JSON.stringify(m2)).toBeLessThanOrEqual(m2.iw + 1);
    });

    test("dropdown panelləri viewport daxilində qalır", async ({ page }) => {
      await open(page);
      for (const id of ["tb-font-family", "tb-font-size", "tb-case", "tb-color", "tb-highlight", "tb-bullets", "tb-spacing", "tb-borders", "tb-shading", "tb-styles-menu"]) {
        const btn = page.getByTestId(id);
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        const menu = page.getByTestId(`${id}-menu`);
        await expect(menu, id).toBeVisible();
        const b = (await menu.boundingBox())!;
        expect(b.x, `${id} sol`).toBeGreaterThanOrEqual(-1);
        expect(b.x + b.width, `${id} sağ (${b.x + b.width} > ${vp.width})`).toBeLessThanOrEqual(vp.width + 1);
        expect(b.y, `${id} yuxarı`).toBeGreaterThanOrEqual(-1);
        await page.keyboard.press("Escape");
        await expect(menu).toHaveCount(0);
      }
      await page.getByTestId("tab-insert").click();
      for (const id of ["tb-table", "tb-special"]) {
        await page.getByTestId(id).scrollIntoViewIfNeeded();
        await page.getByTestId(id).click();
        const b = (await page.getByTestId(`${id}-menu`).boundingBox())!;
        expect(b.x, `${id} sol`).toBeGreaterThanOrEqual(-1);
        expect(b.x + b.width, `${id} sağ`).toBeLessThanOrEqual(vp.width + 1);
        await page.keyboard.press("Escape");
      }
    });

    test("dialoq viewport-a sığır", async ({ page }) => {
      await open(page);
      await page.getByTestId("tab-insert").click();
      await page.getByTestId("tb-image").click();
      const b = (await page.getByTestId("image-dialog").boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(-1);
      expect(b.x + b.width).toBeLessThanOrEqual(vp.width + 1);
      await expect(page.getByTestId("image-insert")).toBeVisible();
    });

    test("yaz + qalın (düymə ilə)", async ({ page }) => {
      await open(page);
      if (vp.width < 800) {
        await ed(page).tap();
      }
      await page.keyboard.type("Mobil mətn");
      await page.keyboard.press("Shift+Home");
      await page.getByTestId("tb-bold").scrollIntoViewIfNeeded();
      if (vp.width < 800) await page.getByTestId("tb-bold").tap();
      else await page.getByTestId("tb-bold").click();
      await expectHtml(page, /<strong>Mobil mətn<\/strong>/);
      await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "true");
      expect(await html(page)).toContain("Mobil mətn");
    });
  });
}
