import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { Calendar, Menu, X, MapPin, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "../contexts/LanguageContext";
const sakuraLogo = "/assets/icon.png";

function FooterLangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/30 p-0.5">
      {(["cs", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
            lang === l
              ? "bg-white text-sakura-green"
              : "text-white/70 hover:text-white"
          }`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function LangToggle({ mobile }: { mobile?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-gray-200 p-0.5 bg-white/60 ${mobile ? "self-start" : ""}`}>
      {(["cs", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
            lang === l
              ? "bg-sakura-green text-white shadow-sm"
              : "text-gray-500 hover:text-sakura-green"
          }`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Layout() {
  const { t } = useLang();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/o-sluzbach", label: t("nav.services") },
    { to: "/cenik", label: t("nav.pricing") },
    { to: "/kontakt", label: t("nav.contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-sakura-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-sakura-cream/90 backdrop-blur-md border-b border-sakura-pink/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src={sakuraLogo} alt="sakura logo" className="w-12 h-12" />
              <span className="font-serif text-2xl font-semibold text-sakura-green">
                SAKURA úklidové služby
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-lg font-medium transition-colors relative py-2 ${isActive ? "text-sakura-pink" : "text-gray-600 hover:text-sakura-pink"}`
                  }>
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-sakura-pink rounded-full"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
              <LangToggle />
              <Link
                to="/kontakt"
                className="flex items-center gap-2 bg-sakura-pink text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#D67A92] transition-colors shadow-sm">
                <Calendar className="w-4 h-4" />
                {t("nav.book")}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-sakura-green"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-sakura-cream border-b border-sakura-pink/20 overflow-hidden">
              <div className="px-4 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-lg font-medium p-2 rounded-lg ${isActive ? "bg-sakura-pink/10 text-sakura-pink" : "text-gray-600"}`
                    }>
                    {link.label}
                  </NavLink>
                ))}
                <LangToggle mobile />
                <Link
                  to="/kontakt"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-sakura-pink text-white px-5 py-3 rounded-xl font-medium mt-2">
                  <Calendar className="w-5 h-5" />
                  {t("nav.book")}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-sakura-green text-white mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <img src={sakuraLogo} alt="sakura logo" className="w-8 h-8" />
              <span className="font-serif text-3xl font-semibold">
                SAKURA úklidové služby
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-center text-sakura-cream/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-sakura-pink" />
                <span>Praha a okolí</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-sakura-pink" />
                <span>+420 720 307 096</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sakura-pink" />
                <a href="mailto:sakura.uklid@gmail.com" className="hover:text-white transition-colors">
                  sakura.uklid@gmail.com
                </a>
              </div>
              <FooterLangToggle />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20 text-center text-sm text-sakura-cream/70">
            {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
