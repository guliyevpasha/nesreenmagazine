import { test, expect, open, html, selectLine } from "./helpers";

test.describe("Sürətli başlıq düymələri (H1–H6)", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("H1–H6 düymələri lentin görünən hissəsindədir və həqiqi başlıq yaradır", async ({ page }) => {
    for (let n = 1; n <= 6; n++) {
      const btn = page.getByTestId(`qh-h${n}`);
      await expect(btn).toBeVisible();
      // Lentin sağa sürüşdürülməsi tələb olunmasın: düymə redaktorun sol yarısında olmalıdır
      const box = await btn.boundingBox();
      expect(box && box.x < 683, `H${n} düyməsi görünən sol hissədə olmalıdır`).toBeTruthy();
    }

    await page.keyboard.type("Başlıq mətni");
    await selectLine(page);
    for (let n = 1; n <= 6; n++) {
      await page.getByTestId(`qh-h${n}`).click();
      expect(await html(page)).toContain(`<h${n}`);
      await expect(page.getByTestId(`qh-h${n}`)).toHaveAttribute("aria-pressed", "true");
    }
    await page.getByTestId("qh-p").click();
    expect(await html(page)).not.toMatch(/<h[1-6]/);
  });
});
