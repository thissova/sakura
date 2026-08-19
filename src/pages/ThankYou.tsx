import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Home, Phone, MessageCircle } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

export function ThankYou() {
  const { t } = useLang();

  // A confirmation page has no business showing up in search results, and the
  // meta tags live in a static index.html, so set it per-visit and undo on exit.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[2.5rem] shadow-sm border border-sakura-pink/20 p-10 md:p-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="w-24 h-24 md:w-28 md:h-28 bg-sakura-green text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Send className="w-12 h-12 md:w-14 md:h-14" />
          </motion.div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-sakura-green mb-5">
            {t("contact.form.success.title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10">
            {t("contact.form.success.sub")}
          </p>

          <div className="border-t border-gray-100 pt-10">
            <p className="text-base font-medium text-[#1A1A1A] mb-6">
              {t("thanks.urgent")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+420720307096"
                className="flex items-center justify-center gap-3 bg-sakura-pink hover:bg-[#D67A92] text-white px-7 py-4 rounded-2xl font-medium transition-colors shadow-md">
                <Phone className="w-5 h-5" />
                +420 720 307 096
              </a>
              <a
                href="https://wa.me/420720307096"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-7 py-4 rounded-2xl font-medium transition-colors shadow-md">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-10 text-sakura-green hover:text-sakura-pink font-medium transition-colors">
            <Home className="w-5 h-5" />
            {t("thanks.back")}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
