import { test as base, expect, type Page } from "@playwright/test";

const NOISE = /Permissions policy violation: unload|favicon|HMR|hot-update|devtools|Download the React DevTools|\[Fast Refresh\]|webpack-hmr|net::ERR_ABORTED/i;

/** Hər testdə konsol/pageerror xətalarını toplayır və testin sonunda uğursuz edir. */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
      page.on("console", (m) => {
        if (m.type() === "error" && !NOISE.test(m.text())) errors.push("console: " + m.text());
      });
      await use(errors);
      expect(errors, "console/page errors").toEqual([]);
    },
    { auto: true },
  ],
});
test.use({ actionTimeout: 8000 });
export { expect };

export const ed = (page: Page) => page.getByTestId("word-editor");

export async function open(page: Page, locale = "az") {
  await page.goto("/admin-editor-test");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (locale !== "az") await page.getByTestId("harness-locale").selectOption(locale);
  await ed(page).waitFor();
  await ed(page).click();
}

export async function reloadKeep(page: Page) {
  await page.reload();
  await ed(page).waitFor();
}

/** Serialized HTML (harness-html) — debounce-ı gözləyir. */
export async function html(page: Page): Promise<string> {
  await page.waitForTimeout(450);
  return (await page.getByTestId("harness-html").textContent()) ?? "";
}
export async function expectHtml(page: Page, re: RegExp | string) {
  await expect
    .poll(async () => (await page.getByTestId("harness-html").textContent()) ?? "", { timeout: 5000 })
    .toMatch(typeof re === "string" ? new RegExp(re.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) : re);
}
export async function expectNoHtml(page: Page, re: RegExp) {
  await page.waitForTimeout(500);
  expect((await page.getByTestId("harness-html").textContent()) ?? "").not.toMatch(re);
}

export async function save(page: Page) {
  await page.waitForTimeout(450);
  await page.getByTestId("harness-save").click();
  await expect(page.getByTestId("harness-render")).toBeVisible({ timeout: 30000 });
  await page.waitForTimeout(400);
}
export const render = (page: Page) => page.getByTestId("harness-render");
export async function renderHtml(page: Page) {
  return await render(page).innerHTML();
}

export async function selectLine(page: Page) {
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
}
export async function selectAll(page: Page) {
  await page.keyboard.press("Control+a");
}
export async function clearEditor(page: Page) {
  await ed(page).click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Delete");
}
/** Dropdown aç → item seç */
export async function openMenu(page: Page, dropdown: string) {
  const b = page.getByTestId(dropdown);
  await b.scrollIntoViewIfNeeded();
  await page.waitForTimeout(120); // ribbon scroll hadisəsi menyunu bağlamasın
  await b.click();
  await page.getByTestId(dropdown + "-menu").waitFor({ timeout: 4000 });
}
export async function pick(page: Page, dropdown: string, item: string) {
  await openMenu(page, dropdown);
  await page.getByTestId(item).click();
}
/** Brauzer paste hadisəsi (HTML) */
export async function pasteHtml(page: Page, h: string, plain?: string) {
  await ed(page).evaluate(
    (el, args) => {
      const dt = new DataTransfer();
      dt.setData("text/html", args.h);
      dt.setData("text/plain", args.p);
      el.focus();
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }));
    },
    { h, p: plain ?? h.replace(/<[^>]+>/g, "") },
  );
}
/** Sətri sona qədər yaz, sonra Enter */
export async function line(page: Page, text: string, enter = true) {
  await page.keyboard.type(text);
  if (enter) await page.keyboard.press("Enter");
}
