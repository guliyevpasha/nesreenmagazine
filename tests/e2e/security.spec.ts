import { test, expect, ed, open, html, save, render, renderHtml, pasteHtml, reloadKeep } from "./helpers";

const PAYLOADS: Record<string, string> = {
  script: '<p>Salam</p><script>window.__xss=1;alert(1)</script>',
  onerror: '<p>img</p><img src=x onerror="window.__xss=1;alert(1)">',
  jslink: '<p><a href="javascript:alert(1)">klik</a></p>',
  iframe: '<p>if</p><iframe src="https://evil.com"></iframe>',
  databrowser: '<p>data</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==">',
  onclick: '<p onclick="alert(1)" onmouseover="alert(2)">hover</p>',
  svg: '<svg onload="alert(1)"><script>alert(3)</script></svg><p>svg</p>',
  style: '<style>body{display:none}</style><p style="background:url(javascript:alert(1))">st</p>',
  formobj: '<form action="https://evil.com"><input name=x></form><object data="x.swf"></object><embed src="x.swf"><p>fo</p>',
  dataLink: '<p><a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">d</a></p>',
};

const BAD = /<script|onerror|onclick|onmouseover|onload|javascript:|evil\.com|data:image|data:text|<iframe[^>]+src|<object|<embed|<form|<style|<svg|base64/i;

test.describe("Təhlükəsizlik", () => {
  for (const [name, payload] of Object.entries(PAYLOADS)) {
    test(`paste: ${name}`, async ({ page }) => {
      const dialogs: string[] = [];
      page.on("dialog", (d) => { dialogs.push(d.message()); void d.dismiss(); });
      await open(page);
      await pasteHtml(page, payload);
      await page.waitForTimeout(500);
      await save(page);
      const r = await renderHtml(page);
      expect(r, "render: " + r).not.toMatch(BAD);
      const editorDom = await ed(page).innerHTML();
      expect(editorDom, "editor DOM: " + editorDom).not.toMatch(/<script|onerror|onclick|javascript:/i);
      expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
      expect(dialogs).toEqual([]);
    });
  }

  test("inject: xam zərərli HTML localStorage-dan yüklənəndə render təmizlənir", async ({ page }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => { dialogs.push(d.message()); void d.dismiss(); });
    await open(page);
    const raw = Object.values(PAYLOADS).join("");
    await page.evaluate((h) => localStorage.setItem("nm-editor-harness", JSON.stringify({ html: h, locale: "az" })), raw);
    await reloadKeep(page);
    await expect(render(page)).toBeVisible({ timeout: 30000 });
    await page.waitForTimeout(500);
    const r = await renderHtml(page);
    expect(r, r).not.toMatch(BAD);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    expect(dialogs).toEqual([]);
    const e = await ed(page).innerHTML();
    expect(e, "editor: " + e).not.toMatch(/<script|onerror|onclick|javascript:|<iframe/i);
  });

  test("link dialoqu javascript: URL-i qəbul etmir", async ({ page }) => {
    await open(page);
    await page.keyboard.type("pis");
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await page.getByTestId("tab-insert").click();
    await page.getByTestId("tb-link").click();
    await page.getByTestId("link-url").fill("javascript:alert(1)");
    const apply = page.getByTestId("link-apply");
    if (await apply.isEnabled()) await apply.click();
    await page.waitForTimeout(500);
    expect(await html(page)).not.toMatch(/javascript:/i);
  });

  test("video dialoqu yad iframe qəbul etmir; şəkil dialoqu javascript:/data: URL qəbul etmir", async ({ page }) => {
    await open(page);
    await page.getByTestId("tab-insert").click();
    await page.getByTestId("tb-video").click();
    await page.getByTestId("video-url").fill("https://evil.com/embed/x");
    await expect(page.getByTestId("video-insert")).toBeDisabled();
    await page.keyboard.press("Escape");
    await page.getByTestId("tb-image").click();
    await page.getByTestId("image-url").fill("javascript:alert(1)");
    const ins = page.getByTestId("image-insert");
    if (await ins.isEnabled()) await ins.click();
    await page.waitForTimeout(500);
    expect(await html(page)).not.toMatch(/javascript:/i);
  });

  test("zərərsiz məzmun (https şəkil, https link) sanitizatordan keçir", async ({ page }) => {
    await open(page);
    await pasteHtml(page, '<p><a href="https://ok.example.com/x">ok</a></p>');
    await save(page);
    expect(await renderHtml(page)).toContain('href="https://ok.example.com/x"');
  });
});
