import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useContent } from "../contexts/ContentContext";
import { LazyImage } from "../components/LazyImage";
import { useLang } from "../contexts/LanguageContext";
export function Services() {
  const { services } = useContent();
  const { t, lang } = useLang();
  const detailedServices = services.filter(
    (s) => s.bullets && s.bullets.length > 0,
  );
  return (
    <div className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-32">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl font-bold text-sakura-green">
            {t('services.title')}
          </motion.h1>
        </div>

        <div className="space-y-32">
          {detailedServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col gap-16 ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center`}>
              <div className="w-full lg:w-1/2 order-1 lg:order-none">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-sakura-green/10 aspect-[4/3] hover-lift">
                  <LazyImage
                    src={service.image}
                    alt={lang === 'en' ? (service.name_en || service.name) : service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="w-full lg:w-1/2 order-2 lg:order-none">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-sakura-pink text-white flex items-center justify-center flex-shrink-0 text-3xl font-serif font-bold shadow-lg">
                    {index + 1}.
                  </div>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold text-sakura-green">
                    {lang === 'en' ? (service.name_en || service.name) : service.name}
                  </h2>
                </div>

                {service.description && (
                  <blockquote className="border-l-4 border-sakura-pink pl-8 py-2 mb-10 text-xl text-gray-600 italic">
                    {lang === 'en' ? (service.description_en || service.description) : service.description}
                  </blockquote>
                )}

                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-sakura-pink/10 hover-lift">
                  <h3 className="font-semibold text-sakura-green mb-8 text-xl">
                    {t('services.includes')}
                  </h3>
                  <ul className="space-y-5 mb-8">
                    {(lang === 'en' && service.bullets_en?.length
                      ? service.bullets_en
                      : service.bullets
                    )?.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-1 bg-sakura-green/10 rounded-full p-1.5 flex-shrink-0">
                          <Check className="w-5 h-5 text-sakura-green" strokeWidth={3} />
                        </div>
                        <span className="text-[#1A1A1A] text-lg">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/cenik"
                    state={service.id === "tepovani" ? { openTepovani: true } : {}}
                    className="inline-flex items-center gap-2 text-sakura-pink font-semibold hover:text-[#D67A92] transition-colors text-lg">
                    {t('services.pricing')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 text-center">
          <Link
            to="/cenik"
            className="inline-flex items-center gap-3 bg-sakura-pink text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-[#D67A92] hover-lift shadow-xl">
            {t('services.all')}
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
