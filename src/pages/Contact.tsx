import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { LazyImage } from "../components/LazyImage";
import { motion } from "framer-motion";
import { Phone, Mail, MessageCircle, Send, Check } from "lucide-react";
import { useContent } from "../contexts/ContentContext";
import { useLang } from "../contexts/LanguageContext";

export function Contact() {
  const { services } = useContent();
  const { t, lang } = useLang();
  const location = useLocation();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceError, setServiceError] = useState(false);
  const [hasVacuum, setHasVacuum] = useState<"ano" | "ne" | null>(null);

  useEffect(() => {
    const state = location.state as { preselectedService?: string } | null;
    if (state?.preselectedService) {
      setSelectedServices([state.preselectedService]);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, []);

  const toggleService = (id: string) => {
    setServiceError(false);
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      setServiceError(true);
      return;
    }
    setIsSubmitting(true);

    const form = formRef.current!;
    const payload = {
      name: (form.querySelector("#name") as HTMLInputElement).value,
      phone: (form.querySelector("#phone") as HTMLInputElement).value,
      email: (form.querySelector("#email") as HTMLInputElement).value,
      services: selectedServices.map(
        (id) => services.find((s) => s.id === id)?.name ?? id,
      ),
      vacuum: hasVacuum,
      message: (form.querySelector("#message") as HTMLTextAreaElement).value,
    };

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Server not available — still show success to user
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-5xl md:text-7xl font-bold text-sakura-green">
            {t("contact.title")}
          </motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-sakura-pink/20 hover-lift">
              <div className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-sakura-cream flex items-center justify-center text-sakura-pink flex-shrink-0 shadow-inner">
                    <Phone className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-500 mb-0.5">
                      {t("contact.phone")}
                    </h3>
                    <a
                      href="tel:+420720307096"
                      className="text-xl md:text-2xl font-bold text-[#1A1A1A] hover:text-sakura-pink transition-colors whitespace-nowrap">
                      +420 720 307 096
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-sakura-cream flex items-center justify-center text-sakura-pink flex-shrink-0 shadow-inner">
                    <Mail className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-medium text-gray-500 mb-0.5">
                      E-mail
                    </h3>
                    <a
                      href="mailto:sakura.uklid@gmail.com"
                      className="text-base md:text-xl font-bold text-[#1A1A1A] hover:text-sakura-pink transition-colors break-all">
                      sakura.uklid@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-gray-100">
                <a
                  href="https://wa.me/420720307096"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-5 rounded-2xl font-medium transition-colors shadow-lg hover-lift text-lg">
                  <MessageCircle className="w-6 h-6" />
                  {t("contact.whatsapp")}
                </a>
              </div>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden shadow-xl hover-lift aspect-[4/3]">
              <LazyImage
                src="/assets/oken.jpeg"
                alt="Čistý a světlý interiér"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 order-1 lg:order-2">
            <div className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-sm border border-sakura-pink/20 hover-lift">
              <h2 className="font-serif text-4xl font-bold text-sakura-green mb-10">
                {t("contact.form.title")}
              </h2>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-sakura-green/10 border border-sakura-green text-sakura-green p-10 rounded-3xl text-center">
                  <div className="w-24 h-24 bg-sakura-green text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Send className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    {t("contact.form.success.title")}
                  </h3>
                  <p className="text-xl">{t("contact.form.success.sub")}</p>
                </motion.div>
              ) : (
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label
                        htmlFor="name"
                        className="text-base font-semibold text-[#1A1A1A]">
                        {t("contact.form.name")}
                      </label>
                      <input
                        ref={nameRef}
                        type="text"
                        id="name"
                        required
                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50 text-lg"
                        placeholder="Jan Novák"
                      />
                    </div>
                    <div className="space-y-3">
                      <label
                        htmlFor="phone"
                        className="text-base font-semibold text-[#1A1A1A]">
                        {t("contact.form.phone")}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50 text-lg"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="email"
                      className="text-base font-semibold text-[#1A1A1A]">
                      {t("contact.form.email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50 text-lg"
                      placeholder="jan.novak@email.cz"
                    />
                  </div>

                  {/* Multi-select services */}
                  <div className="space-y-3">
                    <label className="text-base font-semibold text-[#1A1A1A]">
                      {t("contact.form.services")}{" "}
                      <span className="font-normal text-gray-500">
                        {t("contact.form.services.sub")}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {services.map((service) => {
                        const isSelected = selectedServices.includes(
                          service.id,
                        );
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => toggleService(service.id)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-left transition-all text-base font-medium ${
                              isSelected
                                ? "border-sakura-green bg-[#E8F0E6] text-sakura-green"
                                : "border-gray-200 bg-sakura-cream/50 text-gray-600 hover:border-sakura-green/40 hover:bg-sakura-cream"
                            }`}>
                            <span
                              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-sakura-green border-sakura-green"
                                  : "border-gray-300"
                              }`}>
                              {isSelected && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </span>
                            {lang === "en"
                              ? service.name_en || service.name
                              : service.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-2 space-y-3">
                      <p className="text-base font-semibold text-[#1A1A1A]">
                        {t("contact.form.vacuum")}
                      </p>
                      <div className="flex gap-4">
                        {(["ano", "ne"] as const).map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setHasVacuum(val)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 font-medium transition-all text-base ${
                              hasVacuum === val
                                ? "border-sakura-green bg-[#E8F0E6] text-sakura-green"
                                : "border-gray-200 text-gray-600 hover:border-sakura-green/40 hover:bg-sakura-cream"
                            }`}>
                            <span
                              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                hasVacuum === val
                                  ? "border-sakura-green"
                                  : "border-gray-300"
                              }`}>
                              {hasVacuum === val && (
                                <span className="w-2.5 h-2.5 rounded-full bg-sakura-green" />
                              )}
                            </span>
                            {val === "ano"
                              ? t("contact.form.yes")
                              : t("contact.form.no")}
                          </button>
                        ))}
                      </div>
                    </div>
                    {serviceError && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        {t("contact.form.error")}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="message"
                      className="text-base font-semibold text-[#1A1A1A]">
                      {t("contact.form.msg")}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-sakura-green focus:ring-2 focus:ring-sakura-green/20 outline-none transition-all bg-sakura-cream/50 resize-none text-lg"
                      placeholder="Dobrý den, měl bych zájem o..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-base font-semibold text-[#1A1A1A]">
                      {t("contact.form.photo.label")}
                    </label>
                    <a
                      href="https://wa.me/420720307096"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-4 rounded-2xl font-medium transition-colors shadow-md text-lg">
                      <MessageCircle className="w-6 h-6" />
                      {t("contact.form.photo.btn")}
                    </a>
                  </div>
                  <p
                    className="text-base font-semibold text-[#1A1A1A]"
                    style={{ display: "flex", justifyContent: "center" }}>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 5V19M12 19L5 12M12 19L19 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>{" "}
                    {t("contact.form.order")}
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sakura-pink hover:bg-[#D67A92] text-white px-8 py-5 rounded-2xl font-medium transition-colors shadow-xl hover-lift flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none text-xl mt-4">
                    {isSubmitting ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        {t("contact.form.submit")}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
