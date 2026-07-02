import React, { useEffect, useState, createContext, useContext } from "react";

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  bullets?: string[];
  bullets_en?: string[];
  pricingDesc?: string;
  hasSelect?: boolean;
  showOnHome?: boolean;
  icon?: string;
  name_en?: string;
  description_en?: string;
  pricingDesc_en?: string;
}

interface ContentContextType {
  services: ServiceData[];
  isLoaded: boolean;
  updateService: (id: string, patch: Partial<ServiceData>) => void;
  addService: (service: ServiceData) => void;
  deleteService: (id: string) => void;
  reorderServices: (fromIndex: number, toIndex: number) => void;
  saveAll: () => void;
  resetToDefaults: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const DEFAULT_SERVICES: ServiceData[] = [
  {
    id: "pravidelny", name: "Pravidelný úklid", name_en: "Regular Cleaning",
    description: "", description_en: "", pricingDesc: "1× týdně / 1× za 2 týdny", pricingDesc_en: "weekly / bi-weekly",
    price: "290 Kč / hod", image: "/assets/pravidelny.jpeg", showOnHome: true,
    bullets: ["vysávání všech podlah a koberců","vytírání podlah","utírání prachu ze všech dostupných povrchů","úklid kuchyně (pracovní desky, dřez, vnější plochy spotřebičů)","úklid koupelny a toalety (sanitární zařízení, umyvadlo, WC, baterie)","základní úklid společných prostor v bytě/domě","vynášení odpadků"],
    bullets_en: ["vacuuming all floors and carpets","mopping floors","dusting all accessible surfaces","cleaning kitchen (countertops, sink, exterior of appliances)","cleaning bathroom and toilet (sanitary fixtures, sink, WC, taps)","basic cleaning of shared areas in the apartment/house","taking out trash"],
  },
  {
    id: "generalni", name: "Generální úklid", name_en: "Deep Cleaning",
    description: "Tento úklid je hloubkový a detailní, vhodný po delší době nebo jako jednorázový úklid.",
    description_en: "A thorough and detailed clean, ideal after a long break or as a one-off service.",
    pricingDesc: "", pricingDesc_en: "", price: "350 Kč / hod", image: "/assets/generalni.jpeg", showOnHome: true,
    bullets: ["důkladné vysávání a vytírání všech místností","detailní čištění všech povrchů","hloubkové čištění kuchyně (včetně odmaštění, čištění spotřebičů zvenku i zevnitř dle domluvy)","hloubkové čištění koupelny a toalety (vodní kámen, spáry, sanitární vybavení)","čištění dveří, klik, soklů a rohů","odstranění silnějších nečistot a usazenin","vynášení odpadků"],
    bullets_en: ["thorough vacuuming and mopping of all rooms","detailed cleaning of all surfaces","deep kitchen cleaning (incl. degreasing, appliances inside and out as agreed)","deep bathroom and toilet cleaning (limescale, grout, sanitary fixtures)","cleaning doors, handles, skirting boards and corners","removal of heavy dirt and deposits","taking out trash"],
  },
  {
    id: "okna", name: "Mytí oken", name_en: "Window Cleaning",
    description: "", description_en: "", pricingDesc: "", pricingDesc_en: "", price: "350 Kč / hod", image: "", showOnHome: false,
  },
  {
    id: "zehleni", name: "Žehlení", name_en: "Ironing",
    description: "", description_en: "", pricingDesc: "", pricingDesc_en: "", price: "350 Kč / hod", image: "", showOnHome: false,
  },
  {
    id: "spolecne", name: "Úklid společných prostor", name_en: "Common Area Cleaning",
    description: "", description_en: "", pricingDesc: "(vchody, schodiště)", pricingDesc_en: "(entrances, stairwells)",
    price: "290 Kč / hod", image: "/assets/prostor.jpeg", showOnHome: true,
    bullets: ["zametání a vytírání schodů a chodeb","úklid vstupních prostor","čištění zábradlí a klik","vynášení odpadků (dle domluvy)","udržování čistoty společných prostor","Individuální požadavky po domluvě"],
    bullets_en: ["sweeping and mopping stairs and hallways","cleaning entrance areas","cleaning handrails and door handles","taking out trash (as agreed)","maintaining cleanliness of shared areas","custom requests available on request"],
  },
  {
    id: "kancelare", name: "Úklid kanceláří", name_en: "Office Cleaning",
    description: "", description_en: "", pricingDesc: "", pricingDesc_en: "", price: "290 Kč / hod", image: "/assets/kancelari.jpeg", showOnHome: true,
    bullets: ["vysávání a vytírání podlah","utírání prachu z pracovních ploch","úklid kuchyňky (pokud je součástí)","úklid WC a sociálního zařízení","vynášení odpadků","základní dezinfekce povrchů","Individuální požadavky po domluvě"],
    bullets_en: ["vacuuming and mopping floors","dusting work surfaces","cleaning kitchenette (if available)","cleaning WC and sanitary facilities","taking out trash","basic surface disinfection","custom requests available on request"],
  },
  {
    id: "tepovani", name: "Hloubkové tepování", name_en: "Deep Upholstery Cleaning",
    description: "Profesionální hloubkové čištění (tepování) sedacích souprav, křesel, matrací a koberců.",
    description_en: "Professional deep cleaning (hot water extraction) of sofas, armchairs, mattresses and carpets.",
    pricingDesc: "Vyberte typ sedačky pro tepování", pricingDesc_en: "Select sofa type for cleaning",
    price: "", image: "/assets/tepovani.png", showOnHome: true, hasSelect: true,
    bullets: ["odstranění hluboko usazeného prachu, roztočů a alergenů","likvidace odolných skvrn a nepříjemných pachů","čištění ekologickou a účinnou chemií bezpečnou pro děti a zvířata","hloubkové odsávání vlhkosti profesionálním extraktorem","obnova barev a oživení vzhledu textilních povrchů","Individuální požadavky po domluvě"],
    bullets_en: ["removal of deeply embedded dust, mites and allergens","elimination of stubborn stains and unpleasant odors","cleaning with eco-friendly chemicals safe for children and pets","deep moisture extraction with professional extractor","restoring colors and refreshing the look of textile surfaces","custom requests available on request"],
  },
];

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: ServiceData[]) => {
        setServices(data);
        setIsLoaded(true);
      })
      .catch(() => {
        console.warn("Could not load content from server — using defaults");
        setServices(DEFAULT_SERVICES);
        setIsLoaded(true);
      });
  }, []);

  const saveToServer = (next: ServiceData[]) => {
    fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    }).catch((err) => console.error("Failed to save content:", err));
  };

  const updateService = (id: string, patch: Partial<ServiceData>) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
      saveToServer(next);
      return next;
    });
  };

  const resetToDefaults = () => {
    fetch("/api/content/reset", { method: "POST" })
      .then((r) => r.json())
      .then((defaults: ServiceData[]) => setServices(defaults))
      .catch((err) => console.error("Failed to reset:", err));
  };

  const addService = (service: ServiceData) => {
    setServices((prev) => {
      const next = [...prev, service];
      saveToServer(next);
      return next;
    });
  };

  const reorderServices = (fromIndex: number, toIndex: number) => {
    setServices((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      saveToServer(next);
      return next;
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToServer(next);
      return next;
    });
  };

  const saveAll = () => saveToServer(services);
  return (
    <ContentContext.Provider
      value={{
        services,
        isLoaded,
        updateService,
        addService,
        deleteService,
        reorderServices,
        saveAll,
        resetToDefaults,
      }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
}
