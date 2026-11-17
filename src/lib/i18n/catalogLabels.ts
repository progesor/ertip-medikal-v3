import type { SiteLocale } from "./config";

// SKU matching uses the original catalog values. Translate them only for display.
const englishTerms: Record<string, string> = {
  "el kumandası": "Hand control",
  "ayak kumandası": "Foot control",
  "kolçak": "Armrest",
  "başlık": "Headrest",
  "kumanda": "Control",
  "ayak pedalı": "Foot pedal",
  "sırttan kol": "Back-mounted armrests",
  "yandan kol": "Side-mounted armrests",
  "kapalı başlık": "Closed headrest",
  "açık başlık": "Open headrest",
  "ana model": "Base model",
  "donanım": "Configuration",
  "vizon": "Taupe",
  "yıldız ayak kaplaması": "Star base finish",
  "varyant\türün kodu": "Variant code",
  "kullanma kılavuzu": "Instructions for use",
  "otoklavlanabilir": "Autoclavable",
  "tungsten karbür": "Tungsten carbide",
  "çap ve renk": "Diameter and color",
  "uç uzunluğu": "Tip length",
  "kapak rengi": "Lid color",
  "sütlü kahve": "Latte",
  "açık yeşil": "Light green",
  "kahverengi": "Brown",
  "10'lu kutu": "Box of 10",
  "piyasemen": "Handpiece",
  "5'li kutu": "Box of 5",
  "açık gri": "Light gray",
  "koyu gri": "Dark gray",
  "genişlik": "Width",
  "standart": "Standard",
  "kapaksız": "Without lid",
  "uzunluk": "Length",
  "kırmızı": "Red",
  "turuncu": "Orange",
  "motorlu": "motors",
  "plastik": "Plastic",
  "kapaklı": "With lid",
  "döşeme": "Upholstery",
  "lavabo": "Basin",
  "mürdüm": "Plum",
  "kromaj": "Chrome-plated",
  "motor": "Motor",
  "gövde": "Frame",
  "kapak": "Lid",
  "boyut": "Size",
  "beyaz": "White",
  "gümüş": "Silver",
  "siyah": "Black",
  "pembe": "Pink",
  "yeşil": "Green",
  "altın": "Gold",
  "bordo": "Burgundy",
  "saplı": "With handle",
  "renk": "Color",
  "ölçü": "Size",
  "mavi": "Blue",
  "kısa": "Short",
  "krom": "Chrome",
  "sarı": "Yellow",
  "çap": "Diameter",
  "açı": "Angle",
  "gri": "Gray",
  "bej": "Beige",
  "mor": "Purple"
};

const termPattern = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${Object.keys(englishTerms).join("|")})(?![\\p{L}\\p{N}])`,
  "giu",
);

export function catalogLabel(value: string, locale: SiteLocale) {
  if (!value || locale !== "en") return value;
  return value
    .replace(/Uç Uzunluğu/giu, "Tip length")
    .replace(termPattern, term => englishTerms[term.toLocaleLowerCase("tr")] ?? term)
    .replace(/(\d),(?=\d)/g, "$1.")
    .replace(/mm mm/g, "mm");
}