import { expect, test } from "@playwright/test";

test.describe("M8 business-flow hardening", () => {
  test("mobile navigation opens, searches, and closes accessibly", async ({ page }) => {
    await page.goto("/tr/urunler");

    const openButton = page.getByRole("button", { name: "Mobil menüyü aç" });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const dialog = page.getByRole("dialog", { name: "Mobil navigasyon" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("link", { name: /Teklif Sepeti/ })).toBeVisible();

    const search = page.getByRole("searchbox", { name: "Ürün veya SKU ara" });
    await search.fill("punch test");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/tr\/urunler\?q=punch%20test$/);
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Mobil menüyü aç" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("locale switch rebuilds shared navigation in the target language", async ({ page }) => {
    await page.goto("/tr/urunler");
    await expect(page.getByRole("button", { name: "Mobil menüyü aç" })).toBeVisible();

    await page.getByRole("link", { name: "Switch to English" }).click();

    await expect(page).toHaveURL(/\/en\/products$/);
    await expect(page.getByRole("button", { name: "Open mobile menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Türkçeye geç" })).toBeVisible();
  });

  test("locale switch follows the current route after client navigation", async ({ page }) => {
    await page.goto("/tr");

    await page.getByRole("link", { name: "Teklif sepeti" }).click();
    await expect(page).toHaveURL(/\/tr\/teklif-sepeti$/);

    const switchToEnglish = page.getByRole("link", { name: "Switch to English" });
    await expect(switchToEnglish).toBeVisible();
    await switchToEnglish.click();

    await expect(page).toHaveURL(/\/en\/quote-cart$/);
    await expect(page.getByRole("heading", { name: "Quote Cart" })).toBeVisible();
  });

  test("public locale routing canonicalizes legacy and translated system routes", async ({
    page,
  }) => {
    await page.goto("/urunler");
    await expect(page).toHaveURL(/\/tr\/urunler$/);

    await page.goto("/en/urunler");
    await expect(page).toHaveURL(/\/en\/products$/);

    await page.goto("/tr/products");
    await expect(page).toHaveURL(/\/tr\/urunler$/);
  });

  test("fixed application UI follows the public locale", async ({ page }) => {
    await page.goto("/en/quote-cart");
    await expect(page.getByRole("heading", { name: "Quote Cart" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your List Is Empty" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Browse Products/ })).toBeVisible();

    await page.goto("/tr/teklif-sepeti");
    await expect(page.getByRole("heading", { name: "Teklif Sepeti" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Listeniz Şimdilik Boş" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Ürünleri İncele/ })).toBeVisible();

    await page.goto("/en/unsubscribe");
    await expect(page.getByRole("heading", { name: "Unsubscribe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Unsubscribe Link" })).toBeVisible();
    await expect(page.getByPlaceholder("Your email address...")).toBeVisible();

    await page.goto("/tr/abonelikten-ayril");
    await expect(page.getByRole("heading", { name: "Abonelikten Ayrıl" })).toBeVisible();
    await expect(page.getByRole("button", { name: "İptal Bağlantısı Gönder" })).toBeVisible();
    await expect(page.getByPlaceholder("E-posta adresiniz...")).toBeVisible();
  });

  test("public responses carry the security header baseline", async ({ request }) => {
    const response = await request.get("/");

    expect(response.ok()).toBe(true);
    const headers = response.headers();
    const csp = headers["content-security-policy"];
    const directives = new Map(
      csp.split(";").map((directive) => {
        const [name, ...sources] = directive.trim().split(/\s+/);
        return [name, sources];
      }),
    );
    const frameSources = directives.get("frame-src");
    const connectSources = directives.get("connect-src");

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(directives.get("script-src")).toContain(
      "https://static.cloudflareinsights.com",
    );
    expect(directives.get("script-src-elem")).toContain(
      "https://static.cloudflareinsights.com",
    );
    expect(connectSources).toContain("https://*.cloudflareinsights.com");
    expect(connectSources).toContain("https://*.googleapis.com");
    expect(connectSources).toContain("https://*.gstatic.com");
    expect(frameSources).toContain("https://*.google.com");
    expect(frameSources).toContain("https://*.youtube.com");
    expect(frameSources).toContain("https://*.youtube-nocookie.com");
    expect(frameSources).toContain("https://*.vimeo.com");
    expect(frameSources).not.toContain("https:");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });

  test("site icon endpoint always returns usable browser metadata", async ({ request }) => {
    const response = await request.get("/api/site-icon");

    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(/^image\//);
  });

  test("unused public GraphQL surface is disabled", async ({ request }) => {
    const response = await request.post("/graphql", {
      data: { query: "{ __typename }" },
    });

    expect(response.status()).not.toBe(200);
  });

  test("RFQ endpoint rejects a browser-forged product identity", async ({ request }) => {
    const response = await request.post("/api/public/quote-request", {
      data: {
        customerName: "M8 Browser Test",
        company: "Ertip Test",
        email: "m8-browser@example.invalid",
        phone: "+90 555 000 00 00",
        message: "Forged product identity must not create a quote request.",
        website: "",
        items: [
          {
            productId: "999999999",
            combinationKey: "forged-combination",
            sku: "FORGED-SKU",
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(String(body.message)).toMatch(/sepet|ürün|varyant/i);
  });

  test("protected document endpoint rejects incomplete verification data", async ({ request }) => {
    const response = await request.post("/api/verify-manual", {
      data: {
        productId: "999999999",
        code: "",
        docLabel: "Forged Manual",
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ success: false, message: "Geçersiz istek." });
  });
});
