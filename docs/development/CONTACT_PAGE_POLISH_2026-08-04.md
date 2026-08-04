# Contact Page Production Polish — 2026-08-04

## Goal

Polish the existing contact page without redesigning its visual language or introducing new Payload schema fields.

## Scope

- `ContactFormBlock` now reuses `Site Settings → İletişim Bilgileri` as a fallback when block-specific phone/email values are empty.
- The existing footer legal links are inspected for a KVKK / Aydınlatma entry and, when present, that URL is shown below the contact form.
- Contact form labels are explicitly associated with their controls via `htmlFor` / `id`, common autocomplete hints are provided, and error/success feedback gets live-region semantics.
- Phone and email values in the contact form information cards are actionable `tel:` / `mailto:` links.
- Phone and email rows in `LocationBlock` are actionable links as well.
- The `Haritada Aç` action opens a normal Google Maps search based on the configured address/title rather than sending visitors to the raw iframe embed URL.

## Data ownership

The contact page still allows block-specific quick-contact overrides. When those are absent:

1. Phone falls back to `site-settings.contact.phone`.
2. Email falls back to `site-settings.contact.email`.
3. KVKK link is resolved from `site-settings.footer.bottomLinks` by looking for a label containing `KVKK` or `Aydınlatma`.

Location cards remain independent because individual offices may intentionally have their own phone/email/address values.

## Migration policy

No Payload fields or schema defaults change in this pass. No database migration is required.

## Smoke test

After deployment:

1. Open `/iletisim` and verify the map still renders.
2. Confirm `Haritada Aç` opens Google Maps with the office address.
3. Confirm office phone and email links launch the expected device/browser actions.
4. Confirm the form-side phone/email cards use block-specific values when configured and otherwise fall back to Site Settings.
5. Confirm every visible form label focuses/identifies its matching control.
6. If a KVKK/Aydınlatma bottom link exists in Site Settings, confirm it appears below the submit button and opens the same configured URL.
7. Submit a test contact message and confirm existing success/error behavior is unchanged.
