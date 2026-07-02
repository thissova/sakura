import React, { createContext, useContext, useState } from "react";

type Lang = "cs" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const translations: Record<string, Record<Lang, string>> = {
  // Nav
  "nav.home": { cs: "Úvod", en: "Home" },
  "nav.services": { cs: "O službách", en: "Services" },
  "nav.pricing": { cs: "Ceník", en: "Pricing" },
  "nav.contact": { cs: "Kontakt", en: "Contact" },
  "nav.book": { cs: "Rezervace", en: "Book now" },

  // Home
  "home.tagline": {
    cs: "SAKURA – jsme úklidová služba specializující se na pravidelný úklid bytů, generální úklid, úklid kanceláří, společných prostor a hloubkové tepování. Působíme ve všech částech Prahy – Praha 1 až Praha 22 a přilehlé okolí.",
    en: "SAKURA – a cleaning service specialising in regular apartment cleaning, deep cleaning, office cleaning, common area cleaning and upholstery extraction. We serve all districts of Prague – Praha 1 to Praha 22 and the surrounding area.",
  },
  "home.hero.title": {
    cs: "Profesionální úklidové služby v Praze",
    en: "Professional cleaning services in Prague",
  },
  "home.hero.sub": {
    cs: "Čistota, na kterou se můžete spolehnout",
    en: "Cleanliness you can rely on",
  },
  "home.hero.cta": { cs: "Rezervovat úklid", en: "Book a cleaning" },
  "home.why.title": { cs: "Proč si vybrat nás?", en: "Why choose us?" },
  "home.why.b1": {
    cs: "Rychlý a kvalitní úklid",
    en: "Fast and quality cleaning",
  },
  "home.why.b2": {
    cs: "Šetrná profesionální chemie",
    en: "Gentle, Professional Cleaning Products",
  },
  "home.why.b3": {
    cs: "Férové jednání bez skrytých poplatků",
    en: "Fair dealing with no hidden fees",
  },
  "home.services.title": { cs: "Naše služby", en: "Our services" },
  "home.services.sub": {
    cs: "Vyberte si ideální typ úklidu pro váš domov nebo kancelář",
    en: "Choose the ideal cleaning type for your home or office",
  },
  "home.services.link": {
    cs: "Kompletní ceník služeb",
    en: "Full service pricing",
  },
  "home.how.title": { cs: "Jak to funguje", en: "How it works" },
  "home.how.1.title": { cs: "Nezávazná poptávka", en: "Free inquiry" },
  "home.how.1.desc": {
    cs: "Vyberete si službu a vyplníte krátký formulář nebo nám zavoláte.",
    en: "Choose a service and fill in a short form or give us a call.",
  },
  "home.how.2.title": { cs: "Domluva podrobností", en: "Confirm details" },
  "home.how.2.desc": {
    cs: "Potvrdíme si termín, čas a přesný rozsah úklidu.",
    en: "We confirm the date, time, and scope of the cleaning.",
  },
  "home.how.3.title": { cs: "Čistý domov", en: "Clean home" },
  "home.how.3.desc": {
    cs: "Náš profesionální tým dorazí a precizně uklidí. Platíte až po dokončení práce.",
    en: "Our professional team arrives and cleans thoroughly. You pay only after the job is done.",
  },
  "home.guarantee.title": {
    cs: "Garance kvality a bezpečnosti",
    en: "Quality and safety guarantee",
  },
  "home.guarantee.1.title": { cs: "Spolehlivý personál", en: "Reliable staff" },
  "home.guarantee.1.text": {
    cs: "Všichni naši pracovníci jsou pečlivě prověřeni, proškoleni a dbají na diskrétnost.",
    en: "All our staff are carefully vetted, trained, and maintain discretion.",
  },
  "home.guarantee.2.title": {
    cs: "Pojištění odpovědnosti",
    en: "Liability insurance",
  },
  "home.guarantee.2.text": {
    cs: "Pro váš naprostý klid jsme kompletně pojištěni pro případ nechtěného poškození majetku.",
    en: "For your complete peace of mind, we are fully insured against accidental property damage.",
  },

  // Services
  "services.title": { cs: "Krátce o službách", en: "About our services" },
  "services.includes": { cs: "Zahrnuje:", en: "Includes:" },
  "services.pricing": { cs: "Ceník", en: "Pricing" },
  "services.all": { cs: "Zobrazit kompletní ceník", en: "View full pricing" },

  // Pricing
  "pricing.title": { cs: "Ceník služeb", en: "Service pricing" },
  "pricing.sub": {
    cs: "Kvalitní úklid v Praze a okolí za férové ceny",
    en: "Quality cleaning in Prague and surroundings at fair prices",
  },
  "pricing.book": { cs: "Rezervovat", en: "Book" },
  "pricing.price": { cs: "Ceník", en: "Pricing" },
  "pricing.info.title": {
    cs: "Důležité informace",
    en: "Important information",
  },
  "pricing.info.3": {
    cs: "Pronájem vysavače a mopu činí 300 Kč + doprava (pokud je potřeba).",
    en: "Vacuum and mop rental is 300 CZK + delivery (if needed).",
  },
  "pricing.info.warn": {
    cs: "Minimální objednávka jsou 4 hodiny.",
    en: "Minimum order is 4 hours.",
  },
  "pricing.info.notice": { cs: "Upozornění:", en: "Notice:" },
  "pricing.send": { cs: "Odeslat poptávku", en: "Send inquiry" },
  "pricing.tepovani.sofas": {
    cs: "Sedací soupravy a pohovky",
    en: "Sofas and couches",
  },
  "pricing.tepovani.surcharge": { cs: "Příplatky", en: "Surcharges" },
  "pricing.tepovani.chairs": {
    cs: "Křesla a židle",
    en: "Armchairs and chairs",
  },
  "pricing.tepovani.pillows": { cs: "Polštáře", en: "Pillows" },
  "pricing.tepovani.mattress": {
    cs: "Tepování a čištění matrací (cena za jednu stranu)",
    en: "Mattress cleaning (price per side)",
  },
  "pricing.tepovani.special": {
    cs: "Speciální služby: Odstraňování odolných skvrn a neutralizace zápachu (moč, víno, krev, káva, zvratky atd.) — individuální příplatek (přesná cena bude stanovena na místě nebo na základě fotografie).",
    en: "Special services: Removal of stubborn stains and odor neutralization (urine, wine, blood, coffee, vomit, etc.) — individual surcharge (exact price determined on-site or based on photo).",
  },

  // Contact
  "contact.title": { cs: "Kontaktní informace", en: "Contact information" },
  "contact.phone": { cs: "Telefon", en: "Phone" },
  "contact.form.title": { cs: "Poptávkový formulář", en: "Inquiry form" },
  "contact.form.name": { cs: "Jméno a příjmení", en: "Full name" },
  "contact.form.phone": { cs: "Telefon", en: "Phone" },
  "contact.form.email": { cs: "E-mail", en: "E-mail" },
  "contact.form.services": { cs: "Vyberte služby", en: "Select services" },
  "contact.form.services.sub": {
    cs: "(lze vybrat více)",
    en: "(multiple allowed)",
  },
  "contact.form.vacuum": {
    cs: "Máte vlastní vysavač a mop?",
    en: "Do you have your own vacuum and mop?",
  },
  "contact.form.yes": { cs: "Ano", en: "Yes" },
  "contact.form.no": { cs: "Ne", en: "No" },
  "contact.form.msg": { cs: "Zpráva", en: "Message" },
  "contact.form.photo.label": {
    cs: "Máte fotografii znečištění? (Volitelné) — Pošlete nám ji přes WhatsApp.",
    en: "Have a photo? (Optional) — Send it via WhatsApp.",
  },
  "contact.form.photo.btn": {
    cs: "Odeslat přes WhatsApp",
    en: "Send via WhatsApp",
  },
  "contact.form.order": {
    cs: "Pro dokončení objednávky klikněte níže:",
    en: "To complete your order, click below:",
  },
  "contact.form.submit": { cs: "Odeslat poptávku", en: "Send inquiry" },
  "contact.form.success.title": {
    cs: "Poptávka byla úspěšně odeslána!",
    en: "Inquiry sent successfully!",
  },
  "contact.form.success.sub": {
    cs: "Děkujeme za váš zájem. Brzy se vám ozveme zpět.",
    en: "Thank you for your interest. We will get back to you soon.",
  },
  "contact.form.error": {
    cs: "Prosím vyberte alespoň jednu službu.",
    en: "Please select at least one service.",
  },
  "contact.whatsapp": {
    cs: "Napište nám na WhatsApp",
    en: "Message us on WhatsApp",
  },

  // 404
  "404.title": { cs: "Stránka nenalezena", en: "Page not found" },
  "404.sub": {
    cs: "Omlouváme se, tato stránka neexistuje nebo byla přesunuta.",
    en: "Sorry, this page does not exist or has been moved.",
  },
  "404.back": { cs: "Zpět na úvod", en: "Back to home" },

  // Footer
  "footer.rights": {
    cs: "© 2026 SAKURA Úklidové Služby. Všechna práva vyhrazena.",
    en: "© 2026 SAKURA Cleaning Services. All rights reserved.",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem("sakura_lang") as Lang) ?? "cs",
  );

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("sakura_lang", l);
  };

  const t = (key: string): string => translations[key]?.[lang] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
