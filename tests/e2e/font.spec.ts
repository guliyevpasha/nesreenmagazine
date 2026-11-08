import { test, expect, ed, open, html, expectHtml, expectNoHtml, save, renderHtml, selectLine, pick, reloadKeep } from "./helpers";

test.describe("Font qrupu", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("bold/italic/underline/strike/sub/sup + aria-pressed", async ({ page }) => {
    await page.keyboard.type("Salam");
    await selectLine(page);
    const cases: [string, string][] = [
      ["tb-bold", "<strong>"], ["tb-italic", "<em>"], ["tb-underline", "<u>"],
      ["tb-strike", "<s>"], ["tb-sub", "<sub>"],
    ];
    for (const [id, tag] of cases) {
      await page.getByTestId(id).click();
      await expect(page.getByTestId(id)).toHaveAttribute("aria-pressed", "true");
      await expectHtml(page, tag);
    }
    for (const [id] of cases) {
      await page.getByTestId(id).click();
      await expect(page.getByTestId(id)).toHaveAttribute("aria-pressed", "false");
    }
    await expectNoHtml(page, /<(strong|em|u|s|sub|sup)>/);
    await page.getByTestId("tb-sup").click();
    await expect(page.getByTestId("tb-sup")).toHaveAttribute("aria-pressed", "true");
    await expectHtml(page, "<sup>");
  });

  test("sub və sup eyni anda ola bilmir (Word kimi)", async ({ page }) => {
    await page.keyboard.type("x2");
    await selectLine(page);
    await page.getByTestId("tb-sub").click();
    await page.getByTestId("tb-sup").click();
    const h = await html(page);
    expect(h.includes("<sub>") && h.includes("<sup>"), "sub+sup birlikdə: " + h).toBeFalsy();
  });

  test("şrift ailəsi", async ({ page }) => {
    await page.keyboard.type("Mətn");
    await selectLine(page);
    for (const f of ["Arial", "Georgia", "Times", "Roboto", "Aptos"]) {
      await pick(page, "tb-font-family", `font-${f}`);
      await expectHtml(page, new RegExp(`font-family:[^"]*${f}`, "i"));
    }
  });

  test("şrift ölçüsü: siyahı, xüsusi input, böyüt/kiçilt", async ({ page }) => {
    await page.keyboard.type("Ölçü");
    await selectLine(page);
    await pick(page, "tb-font-size", "size-24");
    await expectHtml(page, "font-size: 24pt");
    await page.getByTestId("tb-font-size").click();
    await page.getByTestId("font-size-input").fill("17");
    await page.getByTestId("font-size-input").press("Enter");
    await expectHtml(page, "font-size: 17pt");
    const size = async () => Number((await html(page)).match(/font-size: ([\d.]+)pt/)![1]);
    await page.getByTestId("tb-grow").click();
    await expect.poll(size).toBeGreaterThan(17);
    const grown = await size();
    await page.getByTestId("tb-shrink").click();
    await page.getByTestId("tb-shrink").click();
    await expect.poll(size).toBeLessThan(grown);
  });

  test("ölçü göstəricisi (font-size-value) seçilmiş mətnin ölçüsünü göstərir", async ({ page }) => {
    await page.keyboard.type("Göstərici");
    await selectLine(page);
    await pick(page, "tb-font-size", "size-24");
    await expect(page.getByTestId("font-size-value")).toHaveText("24");
  });

  test("hərf halı: upper/lower/title/toggle/sentence", async ({ page }) => {
    await page.keyboard.type("salam DÜNYA necəsən");
    const run = async (m: string) => { await selectLine(page); await pick(page, "tb-case", `case-${m}`); };
    await run("upper"); await expect(ed(page)).toContainText("SALAM DÜNYA NECƏSƏN");
    await run("lower"); await expect(ed(page)).toContainText("salam dünya necəsən");
    await run("title"); await expect(ed(page)).toContainText("Salam Dünya Necəsən");
    await run("toggle"); await expect(ed(page)).toContainText("sALAM dÜNYA nECƏSƏN");
    await run("lower"); await run("sentence"); await expect(ed(page)).toContainText("Salam dünya necəsən");
  });

  test("effektlər (shadow/glow/outline/emboss)", async ({ page }) => {
    await page.keyboard.type("Effekt");
    await selectLine(page);
    for (const e of ["shadow", "glow", "outline", "emboss"]) {
      await pick(page, "tb-effects", `effect-${e}`);
      await expect.poll(async () => (await page.getByTestId("harness-html").textContent()) ?? "").toMatch(new RegExp(e, "i"));
    }
  });

  test("highlight + rəng (palitra, hex), reset", async ({ page }) => {
    await page.keyboard.type("Rəngli");
    await selectLine(page);
    await page.getByTestId("tb-highlight").click();
    await page.getByTestId("highlight-grid").locator("button[data-color]").nth(2).click();
    await expectHtml(page, /<mark[^>]*(data-color|background)/);
    await page.getByTestId("tb-highlight").click();
    await page.getByTestId("highlight-grid-hex").fill("#12ab34");
    await page.getByTestId("highlight-grid").getByRole("button", { name: "OK" }).click();
    await expectHtml(page, /12ab34|rgb\(18, 171, 52\)/i);

    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid-hex").fill("#ff0000");
    await page.getByTestId("color-grid").getByRole("button", { name: "OK" }).click();
    await expectHtml(page, /color: (#ff0000|rgb\(255, 0, 0\))/i);
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid").locator("button[data-color]").nth(5).click();
    await expectHtml(page, /color:/);
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid").getByRole("button").first().click();
    await page.getByTestId("tb-highlight").click();
    await page.getByTestId("highlight-grid").getByRole("button").first().click();
    await expectNoHtml(page, /<mark|[^-]color:/);
  });

  test("rəngi sıfırlayandan sonra boş <span> qalmır", async ({ page }) => {
    await page.keyboard.type("Rəng");
    await selectLine(page);
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid").locator("button[data-color]").nth(4).click();
    await expectHtml(page, /color:/);
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid").getByRole("button").first().click();
    await page.keyboard.press("End");
    await page.keyboard.type(" davam");
    await page.waitForTimeout(500);
    expect(await html(page)).not.toMatch(/<span>/);
  });

  test("formatı təmizlə", async ({ page }) => {
    await page.keyboard.type("Təmiz");
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await page.getByTestId("tb-italic").click();
    await pick(page, "tb-font-size", "size-28");
    await page.getByTestId("tb-clear").click();
    await expectNoHtml(page, /<strong>|<em>|font-size/);
    await expect(ed(page)).toContainText("Təmiz");
  });

  test("aktiv vəziyyət kursoru izləyir", async ({ page }) => {
    await page.keyboard.type("aaa ");
    await page.keyboard.press("Control+b");
    await page.keyboard.type("bbb");
    await page.keyboard.press("Control+b");
    await page.keyboard.type(" ccc");
    await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "false");
    await page.keyboard.press("Home");
    for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("End");
    await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "false");
  });

  test("ölçü göstəricisi seçimi izləyir", async ({ page }) => {
    await page.keyboard.type("Böyük");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Kiçik");
    await page.keyboard.press("ArrowUp");
    await selectLine(page);
    await pick(page, "tb-font-size", "size-36");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByTestId("font-size-value")).not.toHaveText("36");
    await page.keyboard.press("ArrowUp");
    await expect(page.getByTestId("font-size-value")).toHaveText("36");
  });

  test("format yeni yazıya sızmır (kursor başqa yerə keçəndə)", async ({ page }) => {
    await page.keyboard.type("Qalın sözdür");
    await page.keyboard.press("Home");
    for (let i = 0; i < 5; i++) await page.keyboard.press("Shift+ArrowRight");
    await page.getByTestId("tb-bold").click();
    await pick(page, "tb-font-size", "size-28");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Yeni abzas");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("End");
    await page.keyboard.type(" son");
    const h = await html(page);
    expect(h).not.toMatch(/<strong[^>]*>[^<]*(Yeni|son)/);
    expect(h).not.toMatch(/font-size: 28pt[^>]*>[^<]*(Yeni|son)/);
    expect(h).toContain("Yeni abzas");
  });

  test("Enter-dən sonra format davam edir, söndürəndən sonra yox", async ({ page }) => {
    await page.keyboard.press("Control+b");
    await page.keyboard.type("qalın");
    await page.keyboard.press("Enter");
    await page.keyboard.type("hələ qalın");
    await expect(page.getByTestId("tb-bold")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Control+b");
    await page.keyboard.type(" normal");
    expect(await html(page)).toMatch(/<strong>hələ qalın<\/strong> normal/);
  });

  test("undo/redo format", async ({ page }) => {
    await page.keyboard.type("Geri");
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await expectHtml(page, "<strong>");
    await page.getByTestId("tb-undo").click();
    await expectNoHtml(page, /<strong>/);
    await page.getByTestId("tb-redo").click();
    await expectHtml(page, "<strong>");
  });

  test("persistence: save + reload formatı bərpa edir", async ({ page }) => {
    await page.keyboard.type("Dayanıqlı mətn");
    await selectLine(page);
    await page.getByTestId("tb-bold").click();
    await page.getByTestId("tb-italic").click();
    await page.getByTestId("tb-underline").click();
    await pick(page, "tb-font-family", "font-Georgia");
    await pick(page, "tb-font-size", "size-20");
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid-hex").fill("#0000ff");
    await page.getByTestId("color-grid").getByRole("button", { name: "OK" }).click();
    await save(page);
    const r = await renderHtml(page);
    expect(r).toContain("<strong>");
    expect(r).toContain("<em>");
    expect(r).toContain("<u>");
    expect(r).toMatch(/font-family:[^"]*Georgia/i);
    expect(r).toMatch(/font-size: ?20pt/);
    expect(r).toMatch(/color: ?(#0000ff|rgb\(0, 0, 255\))/i);
    await reloadKeep(page);
    const e = ed(page);
    await expect(e).toContainText("Dayanıqlı mətn");
    await expect(e.locator("strong")).toHaveCount(1);
    await expect(e.locator("em")).toHaveCount(1);
    await expect(e.locator("u")).toHaveCount(1);
    await expect(e.locator('[style*="font-size: 20pt"]')).toHaveCount(1);
  });
});
