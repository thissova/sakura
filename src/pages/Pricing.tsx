import React, { useEffect, useState, useRef, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Check, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { getServiceIcon } from "../utils/serviceIcons";
import { LazyImage } from "../components/LazyImage";
import { useLang } from "../contexts/LanguageContext";
export function Pricing() {
  const { services } = useContent();
  const { t, lang } = useLang();
  const location = useLocation();
  const [isTepovaniOpen, setIsTepovaniOpen] = useState(false);
  const tepovaniRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (location.state && (location.state as any).openTepovani) {
      setIsTepovaniOpen(true);
      setTimeout(() => {
        tepovaniRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [location]);
  return (
    <div className="py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl font-bold text-sakura-green mb-6">
            {t("pricing.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl text-gray-600">
            {t("pricing.sub")}
          </motion.p>
        </div>

        {/* Pricing List */}
        <div className="space-y-6 mb-24">
          {services.map((item, index) => (
            <Fragment key={item.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-5 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 md:gap-8 shadow-sm border border-sakura-pink/20 hover-lift">
                <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-sakura-cream text-sakura-pink flex items-center justify-center flex-shrink-0 shadow-inner">
                    <span className="scale-75 md:scale-100">
                      {getServiceIcon(item)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-sakura-green">
                      {lang === "en" ? item.name_en || item.name : item.name}
                    </h3>
                    {item.pricingDesc && (
                      <p className="text-gray-500 mt-0.5 text-base md:text-lg">
                        {lang === "en"
                          ? item.pricingDesc_en || item.pricingDesc
                          : item.pricingDesc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  {item.hasSelect ? (
                    <div className="flex flex-row items-center gap-3 w-full">
                      <Link
                        to="/kontakt"
                        state={{ preselectedService: item.id }}
                        className="flex-1 md:flex-none bg-sakura-pink text-white hover:bg-[#D67A92] px-5 md:px-8 py-3 md:py-3.5 rounded-full font-medium transition-colors whitespace-nowrap shadow-md text-center text-sm md:text-base">
                        {t("pricing.book")}
                      </Link>
                      <button
                        onClick={() => setIsTepovaniOpen(!isTepovaniOpen)}
                        className="flex-1 md:flex-none bg-[#E8F0E6] text-sakura-green hover:bg-[#D1E0CE] px-4 md:px-6 py-3 md:py-3.5 rounded-full font-medium transition-colors whitespace-nowrap shadow-sm flex items-center justify-center gap-2 text-sm md:text-base">
                        {t("pricing.price")}
                        {isTepovaniOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <>
                      {item.price && (
                        <div className="font-bold text-sakura-pink text-xl md:text-2xl whitespace-nowrap">
                          {item.price}
                        </div>
                      )}
                      <Link
                        to="/kontakt"
                        state={{ preselectedService: item.id }}
                        className="bg-sakura-pink text-white hover:bg-[#D67A92] px-5 md:px-8 py-3 md:py-3.5 rounded-full font-medium transition-colors whitespace-nowrap shadow-md flex-shrink-0 text-sm md:text-base">
                        {t("pricing.book")}
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Tepování Accordion */}
              {item.hasSelect && (
                <AnimatePresence>
                  {isTepovaniOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden">
                      <div
                        ref={tepovaniRef}
                        className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-sakura-green/20 mt-4 space-y-8">
                        {/* Sedací soupravy a pohovky */}
                        <div>
                          <div className="bg-[#E8F0E6] rounded-xl px-6 py-3 inline-block mb-4">
                            <h4 className="font-bold text-sakura-green text-lg">
                              {t("pricing.tepovani.sofas")}
                            </h4>
                          </div>
                          <ul className="space-y-4 px-2">
                            {[
                              { name: "2-místná sedačka / pohovka", name_en: "2-seater sofa / couch", price: "850 Kč", img: "/assets/sofa-2.PNG" },
                              { name: "3-místná sedačka / pohovka", name_en: "3-seater sofa / couch", price: "1 100 Kč", img: "/assets/sofa-3.PNG" },
                              { name: "4-místná sedačka", name_en: "4-seater sofa", price: "1 350 Kč", img: "/assets/sofa-4.PNG" },
                              { name: "5-místná sedačka", name_en: "5-seater sofa", price: "1 600 Kč", img: "/assets/sofa-5.PNG" },
                              { name: "6-místná sedačka", name_en: "6-seater sofa", price: "1 850 Kč", img: null },
                            ].map((row, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                {row.img && (
                                  <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                    <LazyImage
                                      src={row.img}
                                      alt={lang === "en" ? row.name_en : row.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                                <span className="flex-1 text-[#1A1A1A]">
                                  {lang === "en" ? row.name_en : row.name}
                                </span>
                                <span className="font-bold text-sakura-pink whitespace-nowrap">
                                  {row.price}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Příplatky */}
                        <div>
                          <div className="bg-[#E8F0E6] rounded-xl px-6 py-3 inline-block mb-4">
                            <h4 className="font-bold text-sakura-green text-lg">
                              {t("pricing.tepovani.surcharge")}
                            </h4>
                          </div>
                          <ul className="space-y-3 px-2">
                            {[
                              { name: "Lenoška / rohový díl", name_en: "Chaise longue / corner section", price: "+300 Kč", img: "/assets/sofa-lenoska.PNG" },
                              { name: "Rozkládací část (výsuv na spaní)", name_en: "Pull-out section (sleeping extension)", price: "+399 Kč", img: "/assets/sofa-cast.JPEG" },
                            ].map((row, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <div className="w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                  <LazyImage
                                    src={row.img}
                                    alt={lang === "en" ? row.name_en : row.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <span className="flex-1 text-[#1A1A1A]">
                                  {lang === "en" ? row.name_en : row.name}
                                </span>
                                <span className="font-bold text-sakura-pink">
                                  {row.price}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Křesla a židle */}
                        <div>
                          <div className="bg-[#E8F0E6] rounded-xl px-6 py-3 inline-block mb-4">
                            <h4 className="font-bold text-sakura-green text-lg">
                              {t("pricing.tepovani.chairs")}
                            </h4>
                          </div>
                          <ul className="space-y-3 px-2">
                            {[
                              { name: "Křeslo", name_en: "Armchair", price: "od 450 Kč" },
                              { name: "Židle (pouze sedák)", name_en: "Chair (seat only)", price: "99 Kč" },
                              { name: "Židle (sedák + opěradlo)", name_en: "Chair (seat + backrest)", price: "199 Kč" },
                            ].map((row, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <span className="text-[#1A1A1A]">
                                  {lang === "en" ? row.name_en : row.name}
                                </span>
                                <span className="font-bold text-sakura-pink">
                                  {row.price}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Polštáře */}
                        <div>
                          <div className="bg-[#E8F0E6] rounded-xl px-6 py-3 inline-block mb-4">
                            <h4 className="font-bold text-sakura-green text-lg">
                              {t("pricing.tepovani.pillows")}
                            </h4>
                          </div>
                          <ul className="space-y-3 px-2">
                            {[
                              { name: "Malý polštář", name_en: "Small pillow", price: "100 Kč" },
                              { name: "Velký polštář", name_en: "Large pillow", price: "150 Kč" },
                            ].map((row, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <span className="text-[#1A1A1A]">
                                  {lang === "en" ? row.name_en : row.name}
                                </span>
                                <span className="font-bold text-sakura-pink">
                                  {row.price}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Matrace */}
                        <div>
                          <div className="bg-[#E8F0E6] rounded-xl px-6 py-3 inline-block mb-4">
                            <h4 className="font-bold text-sakura-green text-lg">
                              {t("pricing.tepovani.mattress")}
                            </h4>
                          </div>
                          <ul className="space-y-3 px-2">
                            {[
                              { name: "Jednolůžková matrace (do 100 cm)", name_en: "Single mattress (up to 100 cm)", price: "od 650 Kč" },
                              { name: "Střední matrace (101–140 cm)", name_en: "Medium mattress (101–140 cm)", price: "od 850 Kč" },
                              { name: "Dvoulůžková matrace (141–200 cm)", name_en: "Double mattress (141–200 cm)", price: "od 1 050 Kč" },
                            ].map((row, i) => (
                              <li
                                key={i}
                                className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <span className="text-[#1A1A1A]">
                                  {lang === "en" ? row.name_en : row.name}
                                </span>
                                <span className="font-bold text-sakura-pink">
                                  {row.price}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Speciální služby */}
                        <div className="bg-[#E8F0E6]/50 rounded-2xl p-8 mt-8">
                          <p className="text-sakura-green italic text-lg leading-relaxed">
                            {t("pricing.tepovani.special")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </Fragment>
          ))}
        </div>

        {/* Important Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#E8F0E6] border border-sakura-green/20 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-sakura-green text-white p-3 rounded-full shadow-md">
                <Info className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-4xl font-bold text-sakura-green">
                {t("pricing.info.title")}
              </h2>
            </div>

            <ul className="space-y-6 mb-10">
              {[t("pricing.info.3")].map((info, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="mt-1 bg-sakura-green rounded-full p-1 flex-shrink-0">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-[#1A1A1A] text-xl">{info}</span>
                </li>
              ))}
            </ul>

            <div className="bg-white/60 rounded-2xl p-6 border border-sakura-green/30 flex items-start gap-4">
              <div className="text-amber-500 mt-1">
                <Info className="w-6 h-6" />
              </div>
              <p className="font-medium text-lg text-[#1A1A1A]">
                <strong className="text-sakura-green">
                  {t("pricing.info.notice")}
                </strong>{" "}
                {t("pricing.info.warn")}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center">
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-3 bg-sakura-pink text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-[#D67A92] hover-lift shadow-xl">
            {t("pricing.send")}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
