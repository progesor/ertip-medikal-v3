import "server-only";

import type { SiteLocale } from "@/lib/i18n/config";
import {
  getUiDictionary,
  type UiDictionary,
} from "@/lib/i18n/uiDictionary";
import { readUiTextOverrides } from "@/lib/i18n/uiTextOverrideStore";
import type { UiTextOverrides } from "@/lib/i18n/uiTextOverrides";

export function applyUiTextOverrides(
  dictionary: UiDictionary,
  overrides: UiTextOverrides,
): UiDictionary {
  const merged = Object.fromEntries(
    Object.entries(dictionary).map(([section, values]) => [
      section,
      { ...(values as Record<string, string>) },
    ]),
  ) as unknown as Record<string, Record<string, string>>;

  for (const [path, value] of Object.entries(overrides)) {
    if (!value) continue;

    const [section, field] = path.split(".");
    if (!section || !field || !merged[section] || !(field in merged[section])) {
      continue;
    }

    merged[section][field] = value;
  }

  return merged as unknown as UiDictionary;
}

export async function getResolvedUiDictionary(
  locale: SiteLocale,
): Promise<UiDictionary> {
  const base = getUiDictionary(locale);

  try {
    const overrides = await readUiTextOverrides(locale);
    return applyUiTextOverrides(base, overrides);
  } catch {
    // UI overrides are additive customization. Any storage problem must not
    // make the public website unavailable; the typed dictionaries are canonical
    // fallbacks and remain sufficient on their own.
    return base;
  }
}
