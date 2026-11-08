import { test, expect, openMenu, ed, open, html, expectHtml, save, render, renderHtml, pick, line, pasteHtml, reloadKeep } from "./helpers";

const IMG = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

test.describe("Roundtrip", () => {
  test("uzun məqalə: yaz → saxla → reload → bərpa → render uyğun", async ({ page }) => {
    test.setTimeout(150_000);
    await open(page);
    // H2 + paraqraf
    await page.keyboard.type("Əsas başlıq");
    await page.getByTestId("style-h1").click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Control+b");
    await page.keyboard.type("Qalın");
    await page.keyboard.press("Control+b");
    await page.keyboard.type(" və ");
    await page.keyboard.press("Control+i");
    await page.keyboard.type("kursiv");
    await page.keyboard.press("Control+i");
    await page.keyboard.type(" mətn ");
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid-hex").fill("#c0392b");
    await page.getByTestId("color-grid").getByRole("button", { name: "OK" }).click();
    await page.keyboard.type("rəngli");
    await page.getByTestId("tb-color").click();
    await page.getByTestId("color-grid").getByRole("button").first().click();
    await page.keyboard.press("Enter");
    // alt başlıq
    await page.keyboard.type("Alt bölmə");
    await page.getByTestId("style-h2").click();
    await page.keyboard.press("Enter");
    // siyahılar
    await page.keyboard.press("Control+Shift+7");
    await line(page, "bir");
    await page.keyboard.type("iki");
    await page.keyboard.press("Tab");
    await line(page, "iki-a", false);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Control+Shift+L");
    await line(page, "marker 1");
    await page.keyboard.type("marker 2");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    // sitat
    await page.keyboard.type("Sitat mətni");
    await page.getByTestId("style-quote").click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    // hr + link
    await page.getByTestId("tab-insert").click();
    await page.getByTestId("tb-hr").click();
    await page.keyboard.type("Link: ");
    await page.getByTestId("tb-link").click();
    await page.getByTestId("link-text").fill("nesreen");
    await page.getByTestId("link-url").fill("https://nesreenmagazine.com");
    await page.getByTestId("link-newtab").check();
    await page.getByTestId("link-apply").click();
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    // şəkil
    await page.getByTestId("tb-image").click();
    await page.getByTestId("image-url").fill(IMG);
    await page.getByTestId("image-alt").fill("Nümunə");
    await page.getByTestId("image-caption").fill("Şəkil yazısı");
    await page.getByTestId("image-insert").click();
    // cədvəl (şəkil seçiləndə ribbon «Şəkil» tabına keçir)
    await page.keyboard.press("Control+End");
    await page.getByTestId("tab-insert").click();
    await openMenu(page, "tb-table");
    await page.getByTestId("table-cell-2x2").click();
    await page.keyboard.type("h1");
    await page.keyboard.press("Tab");
    await page.keyboard.type("h2");
    await page.keyboard.press("Tab");
    await page.keyboard.type("c1");
    await page.keyboard.press("Tab");
    await page.keyboard.type("c2");

    const before = await html(page);
    for (const re of [/<h2/, /<h3/, /<strong>/, /<em>/, /color: ?(#c0392b|rgb\(192, 57, 43\))/i, /<ol>[\s\S]*<ol>/, /<ul/, /<blockquote/, /<hr/, /target="_blank"/, /<figure/, /<figcaption>/, /<table/, /<td/]) {
      expect(before, String(re)).toMatch(re);
    }
    expect(before).not.toMatch(/<h1/);

    await save(page);
    const rendered = await renderHtml(page);
    for (const re of [/<h2[^>]*id=/, /<h3[^>]*id=/, /<strong>/, /<em>/, /color: ?(#c0392b|rgb\(192, ?57, ?43\))/i, /<ol[\s\S]*<ol/, /<ul/, /<blockquote/, /<hr/, /target="_blank"/, /<figure/, /<figcaption>/, /<table/, /<img[^>]*alt="Nümunə"/]) {
      expect(rendered, String(re)).toMatch(re);
    }
    const toc = await page.getByTestId("harness-toc").innerText();
    expect(toc).toContain("Əsas başlıq");
    expect(toc).toContain("Alt bölmə");

    await reloadKeep(page);
    const e = ed(page);
    await expect(e.locator("h2")).toHaveText("Əsas başlıq");
    await expect(e.locator("h3")).toHaveText("Alt bölmə");
    await expect(e.locator("strong").first()).toHaveText("Qalın");
    await expect(e.locator("em").first()).toHaveText("kursiv");
    await expect(e.locator("ol ol > li")).toHaveCount(1);
    await expect(e.locator("ul > li")).toHaveCount(2);
    await expect(e.locator("blockquote")).toContainText("Sitat mətni");
    await expect(e.locator("hr")).toHaveCount(1);
    await expect(e.locator("a[href='https://nesreenmagazine.com']")).toHaveText("nesreen");
    await expect(e.locator("figure img")).toHaveCount(1);
    await expect(e.locator("figure figcaption")).toHaveText("Şəkil yazısı");
    await expect(e.locator("table td, table th")).toHaveCount(4);
    // ikinci tur: yenidən serialize eyni olmalıdır (idempotent)
    await ed(page).click();
    await page.keyboard.press("Control+End");
    await page.keyboard.type(" ");
    await page.keyboard.press("Backspace");
    await page.waitForTimeout(500);
    await save(page);
    const rendered2 = await renderHtml(page);
    const norm = (s: string) => s.replace(/<span>|<\/span>/g, "").replace(/\s+/g, "");
    expect(norm(rendered2)).toBe(norm(rendered));
  });

  test("performans: ~300 abzas ilə yazı gecikməsi", async ({ page }) => {
    test.setTimeout(150_000);
    await open(page);
    const measure0 = async () => {
      const lat: number[] = [];
      for (let i = 0; i < 30; i++) {
        const s = Date.now();
        await page.keyboard.type("a");
        await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
        lat.push(Date.now() - s);
      }
      return lat.reduce((a, b) => a + b, 0) / lat.length;
    };
    const baseline = await measure0();
    console.log("BASELINE (boş sənəd) avg ms:", baseline.toFixed(1));
    await page.keyboard.press("Control+a");
    await page.keyboard.press("Delete");
    const paras = Array.from({ length: 300 }, (_, i) => `<p>Abzas nömrə ${i + 1}: Lorem ipsum dolor sit amet, <strong>qalın</strong> və <em>kursiv</em> mətn parçası, Ə ə Ğ ğ İ ı.</p>`).join("");
    const t0 = Date.now();
    await pasteHtml(page, paras);
    await expect(ed(page).locator("p")).toHaveCount(300, { timeout: 60000 });
    console.log("paste 300 paragraphs ms:", Date.now() - t0);
    await page.keyboard.press("Control+End");
    await expectHtml(page, "Abzas nömrə 300");
    // ortada və sonda yazı gecikməsi
    const measure = async (label: string) => {
      const N = 40;
      const lat: number[] = [];
      for (let i = 0; i < N; i++) {
        const t = await page.evaluate(async () => {
          const el = document.querySelector('[data-testid="word-editor"]') as HTMLElement;
          const before = el.textContent!.length;
          const start = performance.now();
          return { start, before };
        });
        void t;
        const s = Date.now();
        await page.keyboard.type("a");
        // brauzer tərəfdə layout/paint bitənə qədər
        await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
        lat.push(Date.now() - s);
      }
      const avg = lat.reduce((a, b) => a + b, 0) / N;
      const sorted = [...lat].sort((a, b) => a - b);
      console.log(`${label}: avg=${avg.toFixed(1)}ms p95=${sorted[Math.floor(N * 0.95)]}ms max=${sorted[N - 1]}ms`);
      return avg;
    };
    const endAvg = await measure("sonda yazı");
    // ortaya keç
    await page.locator("[data-testid=word-editor] p").nth(150).click();
    const midAvg = await measure("ortada yazı");
    // playwright round-trip overhead ~20-40ms daxildir
    expect(endAvg, "sonda orta gecikmə").toBeLessThan(150);
    expect(midAvg, "ortada orta gecikmə").toBeLessThan(150);
    // saxla yoxlaması
    await save(page);
    await expect(render(page).locator("p").first()).toBeVisible();
    void pick;
  });
});
