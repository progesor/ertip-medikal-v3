import { uiDictionaries } from "../../src/lib/i18n/uiDictionary";
import { getNewsletterDictionary } from "../../src/lib/i18n/newsletterDictionary";

type WidenStrings<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? WidenStrings<T[K]>
      : T[K];
};

const englishMatchesTurkish: WidenStrings<typeof uiDictionaries.tr> =
  uiDictionaries.en;
const turkishMatchesEnglish: WidenStrings<typeof uiDictionaries.en> =
  uiDictionaries.tr;

const turkishNewsletter = getNewsletterDictionary("tr");
const englishNewsletter = getNewsletterDictionary("en");
const englishNewsletterMatchesTurkish: WidenStrings<typeof turkishNewsletter> =
  englishNewsletter;
const turkishNewsletterMatchesEnglish: WidenStrings<typeof englishNewsletter> =
  turkishNewsletter;

void englishMatchesTurkish;
void turkishMatchesEnglish;
void englishNewsletterMatchesTurkish;
void turkishNewsletterMatchesEnglish;
