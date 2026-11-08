import { expect, test } from "@playwright/test";

test("redaktor açılır, yazır, qalın edir", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto("/admin-editor-test");
  const ed = page.getByTestId("word-editor");
  await ed.click();
  await page.keyboard.type("Salam dünya");
  await page.keyboard.press("Shift+Home");
  await page.getByTestId("tb-bold").click();
  console.log("HTML", await ed.innerHTML());
  await expect(ed.locator("strong")).toHaveText("Salam dünya");
  await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "true");
  console.log("ERR", errors);
});
