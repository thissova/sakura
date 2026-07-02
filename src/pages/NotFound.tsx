import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

export function NotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-sakura-cream flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg">
        <p className="font-serif text-[10rem] leading-none font-bold text-sakura-pink/20 select-none mb-8">
          404
        </p>
        <h1 className="font-serif text-4xl font-bold text-sakura-green mb-4 -mt-4">
          {t('404.title')}
        </h1>
        <p className="text-gray-500 text-lg mb-10">
          {t('404.sub')}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-sakura-pink hover:bg-[#D67A92] text-white px-8 py-4 rounded-2xl font-medium transition-colors shadow-lg">
          <Home className="w-5 h-5" />
          {t('404.back')}
        </Link>
      </motion.div>
    </div>
  );
}
