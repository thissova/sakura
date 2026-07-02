import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { LazyImage } from "../components/LazyImage";
import { getServiceIcon } from "../utils/serviceIcons";
import { useLang } from "../contexts/LanguageContext";
const heroImage = "/assets/hero.jpeg";
export function Home() {
  const { services } = useContent();
  const { t, lang } = useLang();
  const homeServices = services.filter((s) => s.showOnHome);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };
  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } },
  };
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center pt-20 pb-32">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}>
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-sakura-green/70 via-sakura-green/50 to-black/60"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div initial="initial" animate="animate" variants={fadeIn}>
              <h1 className="font-serif text-5xl md:text-7xl lg:text-[90px] font-bold text-white leading-[1.1] mb-8 drop-shadow-lg">
                {t("home.hero.title")}
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 mb-10 font-light drop-shadow-md">
                {t("home.hero.sub")}
              </p>
              <Link
                to="/kontakt"
                className="inline-flex items-center gap-3 bg-sakura-pink text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-[#D67A92] hover-lift shadow-xl">
                {t("home.hero.cta")}
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="bg-sakura-cream py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-sakura-green leading-relaxed">
            {t("home.tagline")}
          </p>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-24 md:py-32 border-y border-sakura-pink/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-3 mb-12">
              <h2 className="font-serif text-5xl font-bold text-sakura-green text-center">
                {t("home.why.title")}
              </h2>
            </div>
            {[t("home.why.b1"), t("home.why.b2"), t("home.why.b3")].map(
              (benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-sakura-cream p-12 rounded-[2rem] flex flex-col items-center text-center gap-6 border border-sakura-pink/20 hover-lift">
                  <div className="bg-white p-5 rounded-full shadow-md text-sakura-pink">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[#1A1A1A]">
                    {benefit}
                  </h3>
                </motion.div>
              ),
            )}
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 md:py-32 bg-sakura-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16">
            <h2 className="font-serif text-5xl font-bold text-sakura-green mb-6">
              {t("home.services.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("home.services.sub")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {homeServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-sakura-pink/10 hover-lift group">
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <LazyImage
                    src={service.image}
                    alt={
                      lang === "en"
                        ? service.name_en || service.name
                        : service.name
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sakura-cream text-sakura-pink flex items-center justify-center flex-shrink-0">
                      {getServiceIcon(service, "w-6 h-6")}
                    </div>
                    <h3 className="text-xl font-bold text-[#1A1A1A]">
                      {lang === "en"
                        ? service.name_en || service.name
                        : service.name}
                    </h3>
                  </div>
                  <Link
                    to="/kontakt"
                    state={{ preselectedService: service.id }}
                    className="w-full text-center bg-sakura-pink hover:bg-[#D67A92] text-white py-3 rounded-2xl font-medium transition-colors text-base shadow-sm">
                    {t("pricing.book")}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/cenik"
              className="inline-flex items-center gap-3 bg-sakura-pink text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#D67A92] hover-lift shadow-lg">
              {t("home.services.link")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sakura-green text-white py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-serif text-5xl font-bold mb-20 text-center">
            {t("home.how.title")}
          </h2>
          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-white/20"></div>

            {[
              { title: t("home.how.1.title"), desc: t("home.how.1.desc") },
              { title: t("home.how.2.title"), desc: t("home.how.2.desc") },
              { title: t("home.how.3.title"), desc: t("home.how.3.desc") },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-sakura-pink text-white flex items-center justify-center text-3xl font-serif font-bold mb-8 shadow-xl z-10 relative">
                  {index + 1}
                </div>
                <h3 className="text-3xl font-serif font-semibold mb-5">
                  {step.title}
                </h3>
                <p className="text-sakura-cream/90 text-lg leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-5xl font-bold text-sakura-green text-center mb-20">
            {t("home.guarantee.title")}
          </h2>
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-sakura-pink/10 flex flex-col sm:flex-row gap-8 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-sakura-cream flex items-center justify-center text-sakura-green shadow-inner">
                  <Users className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">
                  {t("home.guarantee.1.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t("home.guarantee.1.text")}
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-sakura-pink/10 flex flex-col sm:flex-row gap-8 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-sakura-cream flex items-center justify-center text-sakura-green shadow-inner">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-4">
                  {t("home.guarantee.2.title")}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {t("home.guarantee.2.text")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
