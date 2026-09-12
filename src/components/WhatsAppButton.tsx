import { useLang } from "../contexts/LanguageContext";

const WHATSAPP_URL = "https://wa.me/420720307096";

/**
 * Floating WhatsApp shortcut, pinned bottom-right on every public page.
 * Sits under the sticky header (z-50) so an open mobile menu stays on top, and
 * keeps clear of the iPhone home indicator via the safe-area inset.
 */
export function WhatsAppButton() {
  const { t } = useLang();

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("contact.whatsapp")}
      title={t("contact.whatsapp")}
      className="group fixed right-4 md:right-6 z-40 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
      {/* Soft pulse ring; the global reduced-motion rule stills it. */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />
      <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
        <svg
          viewBox="0 0 32 32"
          className="h-7 w-7 md:h-8 md:w-8"
          fill="currentColor"
          aria-hidden="true">
          <path d="M16.004 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.26.59 4.47 1.72 6.42L3.1 28.8l6.54-1.71A12.76 12.76 0 0 0 16 28.8c7.06 0 12.8-5.74 12.8-12.8S23.06 3.2 16.004 3.2Zm0 23.36c-1.97 0-3.9-.53-5.58-1.53l-.4-.24-3.88 1.02 1.03-3.78-.26-.39A10.52 10.52 0 0 1 5.44 16c0-5.83 4.74-10.56 10.56-10.56 5.83 0 10.56 4.73 10.56 10.56 0 5.83-4.73 10.56-10.56 10.56Zm5.79-7.9c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66 0 1.57 1.14 3.08 1.3 3.3.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.46.21 2.01.13.61-.09 1.88-.77 2.15-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </span>
    </a>
  );
}
