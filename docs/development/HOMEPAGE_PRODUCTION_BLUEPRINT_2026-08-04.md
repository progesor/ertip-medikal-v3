# Homepage Production Blueprint — 2026-08-04

## Goal

Replace the temporary homepage composition with a concise, CMS-managed corporate/product showcase that remains useful while the product catalogue is still being completed.

The first production homepage should prefer clarity, trust and navigation over maximum block count. Existing Page Builder blocks are sufficient; a homepage-specific rendering framework is not required.

## Recommended block order

### 1. Hero — `HeroBlock`

Use one strong hero rather than the current full-screen slider.

Recommended settings:

- Eyebrow: `Ertip Medikal`
- Heading: `Medikal Çözümlerde Güvenilir İş Ortağınız`
- Subheading: concise statement covering medical devices, surgical instruments and product/support access without unsupported superlatives
- Height: `large`
- Content alignment: `left`
- Content width: `standard`
- Theme: `dark` or `primary`, selected according to the chosen image
- Overlay: `medium`
- Breadcrumb: off
- Primary CTA: `Ürünleri İncele` → `/urunler`
- Secondary CTA: `Bize Ulaşın` → `/iletisim`

Use separate mobile/desktop images when the desktop crop does not survive portrait layouts. Avoid `screen` height unless the final artwork specifically needs it.

### 2. Product categories — `ProductCategoryShowcaseBlock`

Purpose: answer “Ertip ne sunuyor?” before asking the visitor to browse individual products.

Recommended settings:

- Eyebrow: `Ürün Grupları`
- Title: `İhtiyacınıza Uygun Çözümleri Keşfedin`
- Selection: `manual` while the catalogue is being curated
- Select 4–6 representative top-level categories
- Layout: `grid`
- Columns: `3` or `4` depending on final selected category count
- Card style: `overlay`
- Image ratio: `4:3`
- Description: on, but keep category descriptions concise
- Product count: **off until catalogue population is substantially complete**
- Include child products: on

Once the catalogue is complete, product counts can be enabled without a code change.

### 3. Trust / service reasons — `FeaturesBlock`

Recommended title: `Neden Ertip Medikal?`

Use four concise cards. Suggested safe themes:

1. `Ürün Odaklı Uzmanlık` — product selection and application-focused guidance.
2. `Teknik Destek` — accessible communication for product and technical questions.
3. `Geniş Ürün Yelpazesi` — multiple medical device/instrument groups in one catalogue.
4. `Satış Sonrası İletişim` — continued contact after product delivery.

Do not add certifications, guarantee periods, market leadership, export-country counts or clinical outcome claims unless the content is explicitly verified.

Recommended layout:

- Columns: four
- Card style: soft or outlined
- Icon style: boxed
- Background: light/muted according to surrounding sections

### 4. Featured products — `FeaturedProductsBlock`

Show only products whose content and images are already production-ready.

Recommended settings:

- Title: `Öne Çıkan Ürünler`
- 4 products on the first production homepage
- Prefer a varied selection across important product groups
- Replace selections from CMS as catalogue population progresses

The block is a curated showcase, not a substitute for the full catalogue.

### 5. Company introduction — `MediaTextBlock`

Use one strong corporate, production, showroom or product-detail image together with a short company introduction.

Recommended settings:

- Eyebrow: `Ertip Medikal`
- Title: `Medikal Ürün ve Cihaz Çözümleri`
- Layout: split
- Ratio: equal or media-one-third depending on the selected image
- Image position: alternate based on the page visual rhythm
- Theme: light or muted
- CTA: `Hakkımızda` → `/hakkimizda`

Content should explain what the company does and who it serves. Avoid turning this section into a long corporate history; the full story belongs on the About page.

### 6. News / congresses — `NewsFeedBlock`

Recommended settings:

- Title: `Kongreler ve Duyurular`
- Description: short sentence indicating current company/sector updates
- Limit: `3`
- Filters: off

This section should be omitted temporarily if there are no production-quality published entries rather than showing placeholder content.

### 7. Contact CTA — `CTABlock`

Recommended content:

- Eyebrow: `İletişim`
- Title: `Ürünlerimiz hakkında bilgi almak ister misiniz?`
- Description: invite visitors to contact the team for product, quotation or technical questions
- Layout: card or banner
- Theme: primary/dark
- Primary CTA: `Bize Ulaşın` → `/iletisim`
- Secondary CTA: `Ürünleri İncele` → `/urunler`

Keep the trust note empty unless a specific verified statement is needed.

### 8. Newsletter — `NewsletterBlock`

Keep the existing newsletter section at the bottom of the content area if newsletter collection remains part of the launch scope.

## Blocks intentionally deferred from the first production homepage

### `HeroSliderBlock`

Not needed for launch. A single hero creates a stronger hierarchy, transfers fewer large images, avoids carousel interaction overhead and keeps the primary message clear.

### `ProcessBlock`

The current “Nasıl Çalışıyoruz?” placeholder should be removed. Reintroduce only when there is a real, useful process to communicate.

### `StatsBlock`

Do not publish arbitrary company figures. Add later only when metrics are verified and useful to customers.

### `CertificateGridBlock`

Keep the detailed certificate gallery on the dedicated certificate page. The homepage can link to that page from the trust/company content without loading a large certificate gallery and modal experience into the landing page.

### Testimonials / logo sliders

Add only when the underlying customer/partner permissions and content are production-ready.

## Homepage SEO ownership

The `home` Page entry is the editorial owner of homepage SEO metadata. The runtime should use `page.meta` when supplied, while retaining safe defaults when those fields are empty.

Suggested metadata direction:

- SEO title: `Ertip Medikal | Medikal Cihazlar ve Cerrahi Ürünler`
- Description: concise summary of the actual catalogue and support scope
- OG image: a dedicated brand/product composition rather than a random hero crop

Exact wording should be finalized after the homepage product/category selection is complete.

## Performance rules

- Keep one hero image pair (desktop/mobile) instead of multiple full-width slider images.
- Use the existing image-delivery optimization pipeline for uploaded visuals.
- Do not place the full certificate gallery on the homepage.
- Keep NewsFeed at 3 entries with filters off.
- Keep featured products to 4 for the first launch composition.
- Avoid duplicate category/product sections that lead to the same destination.
- Product/category counts should stay hidden until catalogue population is representative.

## Launch acceptance

The homepage is ready for production when:

1. all placeholder slide/process text is removed;
2. hero CTA links resolve correctly;
3. selected categories have production images and descriptions;
4. featured products are complete and published;
5. company text contains no unsupported claims;
6. news section contains real entries or is temporarily omitted;
7. CTA and newsletter flows work;
8. mobile and desktop visual hierarchy is checked;
9. PageSpeed remains within the already accepted performance range;
10. homepage SEO fields are populated in the `home` Page record.
