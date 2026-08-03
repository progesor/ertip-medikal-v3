import { expect, test } from "@playwright/test";

test.describe("M8 business-flow hardening", () => {
  test("mobile navigation opens, searches, and closes accessibly", async ({ page }) => {
    await page.goto("/urunler");

    const openButton = page.getByRole("button", { name: "Mobil menüyü aç" });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const dialog = page.getByRole("dialog", { name: "Mobil navigasyon" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("link", { name: /Teklif Sepeti/ })).toBeVisible();

    const search = page.getByRole("searchbox", { name: "Ürün veya SKU ara" });
    await search.fill("punch test");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/urunler\?q=punch%20test$/);
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Mobil menüyü aç" }).click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("public responses carry the security header baseline", async ({ request }) => {
    const response = await request.get("/");

    expect(response.ok()).toBe(true);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
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
