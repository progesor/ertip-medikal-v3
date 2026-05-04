// src/lib/themeConfig.ts

export const themePalettes = {
    "dark-luxury": {
        // Gece Mavisi & Altın (Sitenin Orijinal Varsayılanı)
        "--primary": "222.2 47.4% 11.2%",
        "--primary-foreground": "210 40% 98%",
        "--background": "0 0% 100%",
        "--foreground": "222.2 84% 4.9%",
        "--muted": "210 40% 96.1%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--secondary": "210 40% 96.1%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--border": "214.3 31.8% 91.4%",
        "--ring": "222.2 84% 4.9%",
        "--surface": "0 0% 100%",
        "--surface-muted": "210 40% 98%",
        "--text-main": "222.2 84% 4.9%",
        "--text-muted": "215.4 16.3% 46.9%",
    },
    ocean: {
        // Ocean Trust (Ferah Turkuaz & Derin Deniz) - Yumuşatıldı
        "--primary": "196 80% 42%", // Daha canlı bir medikal mavi
        "--primary-foreground": "0 0% 100%",
        "--background": "196 20% 99%",
        "--foreground": "196 50% 18%", // Footer için tatlı bir derin lacivert (siyah değil)
        "--muted": "196 30% 94%", // Pasif butonlar için çok açık buz mavisi
        "--muted-foreground": "196 15% 45%",
        "--secondary": "196 40% 92%", // İkincil alanlar için ferah ton
        "--secondary-foreground": "196 80% 30%",
        "--border": "196 25% 90%",
        "--ring": "196 80% 42%",
        "--surface": "0 0% 100%",
        "--surface-muted": "196 30% 96%",
        "--text-main": "196 50% 12%",
        "--text-muted": "196 15% 45%",
    },
    emerald: {
        // Medical Emerald (Güven Veren Zümrüt) - Yumuşatıldı
        "--primary": "152 65% 38%", // Dengeli, güven veren medikal yeşil
        "--primary-foreground": "0 0% 100%",
        "--background": "152 20% 99%",
        "--foreground": "152 40% 18%", // Footer için derin, şık orman yeşili
        "--muted": "152 20% 94%", // Pasif alanlar için çok hafif nane yeşili
        "--muted-foreground": "152 15% 40%",
        "--secondary": "152 30% 90%", // Hover ve ikincil butonlar için ferah zümrüt
        "--secondary-foreground": "152 65% 25%",
        "--border": "152 25% 90%",
        "--ring": "152 65% 38%",
        "--surface": "0 0% 100%",
        "--surface-muted": "152 20% 96%",
        "--text-main": "152 40% 12%",
        "--text-muted": "152 15% 40%",
    },
    ruby: {
        // Ruby Premium (Yakut Kırmızısı)
        "--primary": "346 80% 45%",
        "--primary-foreground": "0 0% 100%",
        "--background": "346 20% 99%",
        "--foreground": "346 40% 15%",
        "--muted": "346 20% 95%",
        "--muted-foreground": "346 15% 45%",
        "--secondary": "346 30% 92%",
        "--secondary-foreground": "346 80% 30%",
        "--border": "346 25% 90%",
        "--ring": "346 80% 45%",
        "--surface": "0 0% 100%",
        "--surface-muted": "346 20% 96%",
        "--text-main": "346 40% 15%",
        "--text-muted": "346 15% 45%",
    },
};

export const radiusConfig = {
    sharp: {
        "--radius": "0rem",
        "--radius-xl": "0rem",
        "--radius-2xl": "0rem",
        "--radius-3xl": "0rem",
    },
    modern: {
        "--radius": "0.5rem",
        "--radius-xl": "1rem",
        "--radius-2xl": "2rem",
        "--radius-3xl": "3rem",
    },
    bubbly: {
        "--radius": "1rem",
        "--radius-xl": "1.5rem",
        "--radius-2xl": "2.5rem",
        "--radius-3xl": "4rem",
    },
};