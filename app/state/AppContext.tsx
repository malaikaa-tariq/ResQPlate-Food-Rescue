"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const translations: Record<
  string,
  Record<string, string>
> = {
  en: {
    overview: "Overview",
    pantry: "My pantry",
    map: "Rescue map",
    pickups: "Pickups",
    recipes: "Recipe rescue",
    impact: "Community impact",
    search: "Search food, donations, recipes…",
    morning: "Good morning",
    attention: "Here’s what needs your attention today.",
    rescue: "Rescue food",
    mission: "TODAY’S RESCUE MISSION",
    save: "Save it before it’s wasted.",
    review: "Review expiring food",
    findRecipe: "Find a recipe",
    useSoon: "Use soon",
    near: "Rescue near you",
  },

  ur: {
    overview: "جائزہ",
    pantry: "میری پینٹری",
    map: "ریسکیو نقشہ",
    pickups: "پک اپس",
    recipes: "ریسکیو تراکیب",
    impact: "کمیونٹی اثر",
    search: "کھانا، عطیات یا تراکیب تلاش کریں…",
    morning: "صبح بخیر",
    attention: "آج آپ کی توجہ کی ضرورت یہ ہے۔",
    rescue: "کھانا بچائیں",
    mission: "آج کا ریسکیو مشن",
    save: "ضائع ہونے سے پہلے بچائیں۔",
    review: "جلد ختم ہونے والا کھانا دیکھیں",
    findRecipe: "ترکیب تلاش کریں",
    useSoon: "جلد استعمال کریں",
    near: "آپ کے قریب ریسکیو",
  },

  pa: {
    overview: "ਸੰਖੇਪ",
    pantry: "ਮੇਰੀ ਪੈਂਟਰੀ",
    map: "ਬਚਾਅ ਨਕਸ਼ਾ",
    pickups: "ਪਿਕਅੱਪ",
    recipes: "ਭੋਜਨ ਬਚਾਅ ਵਿਅੰਜਨ",
    impact: "ਕਮਿਊਨਿਟੀ ਪ੍ਰਭਾਵ",
    search: "ਭੋਜਨ, ਦਾਨ ਜਾਂ ਵਿਅੰਜਨ ਲੱਭੋ…",
    morning: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ",
    attention: "ਅੱਜ ਇਨ੍ਹਾਂ ਚੀਜ਼ਾਂ ਵੱਲ ਧਿਆਨ ਦਿਓ।",
    rescue: "ਭੋਜਨ ਬਚਾਓ",
    mission: "ਅੱਜ ਦਾ ਬਚਾਅ ਮਿਸ਼ਨ",
    save: "ਬਰਬਾਦ ਹੋਣ ਤੋਂ ਪਹਿਲਾਂ ਬਚਾਓ।",
    review: "ਜਲਦੀ ਖਰਾਬ ਹੋਣ ਵਾਲਾ ਭੋਜਨ ਵੇਖੋ",
    findRecipe: "ਵਿਅੰਜਨ ਲੱਭੋ",
    useSoon: "ਜਲਦੀ ਵਰਤੋ",
    near: "ਨੇੜੇ ਭੋਜਨ ਬਚਾਅ",
  },

  sd: {
    overview: "جائزو",
    pantry: "منهنجي پينٽري",
    map: "بچاءَ جو نقشو",
    pickups: "پڪ اپ",
    recipes: "بچاءَ جون ترڪيبون",
    impact: "برادري جو اثر",
    search: "کاڌو، عطيو يا ترڪيب ڳوليو…",
    morning: "صبح جو سلام",
    attention: "اڄ هنن شين تي ڌيان ڏيو۔",
    rescue: "کاڌو بچايو",
    mission: "اڄ جو بچاءَ مشن",
    save: "ضايع ٿيڻ کان اڳ بچايو۔",
    review: "جلد ختم ٿيندڙ کاڌو ڏسو",
    findRecipe: "ترڪيب ڳوليو",
    useSoon: "جلد استعمال ڪريو",
    near: "ويجهو کاڌو بچاءَ",
  },

  ps: {
    overview: "لنډیز",
    pantry: "زما خوراکي زېرمه",
    map: "د ژغورنې نقشه",
    pickups: "راټولونه",
    recipes: "د ژغورنې خواړه",
    impact: "ټولنیز اغېز",
    search: "خواړه، مرسته یا ترکیب ولټوئ…",
    morning: "سهار مو پخیر",
    attention: "نن دې شیانو ته پاملرنه وکړئ.",
    rescue: "خواړه وژغورئ",
    mission: "د نن ژغورنې ماموریت",
    save: "له ضایع کېدو مخکې یې وژغورئ.",
    review: "ژر ختمېدونکي خواړه وګورئ",
    findRecipe: "ترکیب ومومئ",
    useSoon: "ژر یې وکاروئ",
    near: "نږدې ژغورنه",
  },

  ar: {
    overview: "نظرة عامة",
    pantry: "مخزوني",
    map: "خريطة الإنقاذ",
    pickups: "الاستلام",
    recipes: "وصفات الإنقاذ",
    impact: "أثر المجتمع",
    search: "ابحث عن طعام أو تبرعات أو وصفات…",
    morning: "صباح الخير",
    attention: "إليك ما يحتاج انتباهك اليوم.",
    rescue: "أنقذ الطعام",
    mission: "مهمة الإنقاذ اليوم",
    save: "أنقذه قبل أن يُهدر.",
    review: "راجع الطعام القريب من الانتهاء",
    findRecipe: "ابحث عن وصفة",
    useSoon: "استخدم قريباً",
    near: "إنقاذ بالقرب منك",
  },

  es: {
    overview: "Resumen",
    pantry: "Mi despensa",
    map: "Mapa de rescate",
    pickups: "Recogidas",
    recipes: "Recetas de rescate",
    impact: "Impacto comunitario",
    search: "Buscar comida, donaciones o recetas…",
    morning: "Buenos días",
    attention: "Esto necesita tu atención hoy.",
    rescue: "Rescatar comida",
    mission: "MISIÓN DE RESCATE DE HOY",
    save: "Sálvala antes de desperdiciarla.",
    review: "Revisar alimentos",
    findRecipe: "Buscar receta",
    useSoon: "Usar pronto",
    near: "Rescate cerca de ti",
  },

  fr: {
    overview: "Aperçu",
    pantry: "Mon garde-manger",
    map: "Carte de sauvetage",
    pickups: "Collectes",
    recipes: "Recettes anti-gaspi",
    impact: "Impact communautaire",
    search: "Rechercher aliments, dons ou recettes…",
    morning: "Bonjour",
    attention:
      "Voici ce qui demande votre attention aujourd’hui.",
    rescue: "Sauver des aliments",
    mission: "MISSION DU JOUR",
    save: "Sauvez-les avant le gaspillage.",
    review: "Voir les aliments urgents",
    findRecipe: "Trouver une recette",
    useSoon: "À utiliser bientôt",
    near: "Sauvetages proches",
  },
};

type TranslateWindow = Window & {
  google?: {
    translate: {
      TranslateElement: new (
        options: {
          pageLanguage: string;
          includedLanguages: string;
          autoDisplay: boolean;
        },
        id: string
      ) => unknown;
    };
  };
  googleTranslateElementInit?: () => void;
};

export type UserRole = "donor" | "receiver";

export type UserAccount = {
  name: string;
  email: string;
} | null;

export type AccessibilitySettings = {
  reducedMotion: boolean;
  highContrast: boolean;
};

type AppContextValue = {
  user: UserAccount;
  setUser: (user: UserAccount) => void;

  role: UserRole;
  setRole: (role: UserRole) => void;

  accessibility: AccessibilitySettings;
  setAccessibility: (
    settings: AccessibilitySettings
  ) => void;

  theme: string;
  toggleTheme: () => void;

  location: string;
  setLocation: (location: string) => void;

  lang: string;
  setLang: (language: string) => void;

  t: (key: string) => string;
};

const AppContext =
  createContext<AppContextValue | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<UserAccount>(null);

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window === "undefined") {
      return "receiver";
    }

    const savedRole =
      localStorage.getItem("resq-role");

    return savedRole === "donor" ||
      savedRole === "receiver"
      ? savedRole
      : "receiver";
  });

  const [accessibility, setAccessibility] =
    useState<AccessibilitySettings>(() => {
      if (typeof window === "undefined") {
        return {
          reducedMotion: false,
          highContrast: false,
        };
      }

      try {
        const savedSettings = localStorage.getItem(
          "resq-accessibility"
        );

        if (savedSettings) {
          return JSON.parse(
            savedSettings
          ) as AccessibilitySettings;
        }
      } catch {
        // Use the default accessibility settings.
      }

      return {
        reducedMotion: false,
        highContrast: false,
      };
    });

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return (
      localStorage.getItem("resq-theme") ||
      "light"
    );
  });

  const [location, setLocation] = useState(
    "Karachi, Pakistan"
  );

  const [lang, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return (
      localStorage.getItem("resq-language") ||
      "en"
    );
  });

  const t = (key: string) => {
    return (
      translations[lang]?.[key] ||
      translations.en[key] ||
      key
    );
  };

  useEffect(() => {
    const translateWindow =
      window as TranslateWindow;

    const initializeGoogleTranslate = () => {
      const container = document.getElementById(
        "google_translate_element"
      );

      if (
        !translateWindow.google ||
        container?.hasChildNodes()
      ) {
        return;
      }

      new translateWindow.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages:
            "en,ur,pa,sd,ps,ar,es,fr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    translateWindow.googleTranslateElementInit =
      initializeGoogleTranslate;

    if (translateWindow.google) {
      initializeGoogleTranslate();
      return;
    }

    if (
      !document.getElementById(
        "google-translate-script"
      )
    ) {
      const script =
        document.createElement("script");

      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;

      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("resq-role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(
      "resq-accessibility",
      JSON.stringify(accessibility)
    );

    document.documentElement.dataset.reducedMotion =
      String(accessibility.reducedMotion);

    document.documentElement.dataset.highContrast =
      String(accessibility.highContrast);
  }, [accessibility]);

  useEffect(() => {
    localStorage.setItem(
      "resq-language",
      lang
    );

    document.documentElement.lang = lang;

    const rightToLeftLanguages = [
      "ur",
      "sd",
      "ps",
      "ar",
    ];

    document.documentElement.dir =
      rightToLeftLanguages.includes(lang)
        ? "rtl"
        : "ltr";

    let attempts = 0;

    const timer = window.setInterval(() => {
      const languageSelector =
        document.querySelector<HTMLSelectElement>(
          ".goog-te-combo"
        );

      if (languageSelector) {
        if (languageSelector.value !== lang) {
          languageSelector.value = lang;

          languageSelector.dispatchEvent(
            new Event("change", {
              bubbles: true,
            })
          );
        }

        window.clearInterval(timer);
      } else {
        attempts += 1;

        if (attempts > 20) {
          window.clearInterval(timer);
        }
      }
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, [lang]);

  const setLang = (language: string) => {
    setLanguage(language);
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme =
        currentTheme === "light"
          ? "dark"
          : "light";

      localStorage.setItem(
        "resq-theme",
        nextTheme
      );

      return nextTheme;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        accessibility,
        setAccessibility,
        theme,
        toggleTheme,
        location,
        setLocation,
        lang,
        setLang,
        t,
      }}
    >
      <div
        id="google_translate_element"
        aria-hidden="true"
      />

      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return context;
}