import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LazyImage } from "./LazyImage";
import { useLang } from "../contexts/LanguageContext";

// Before/after composites supplied by the client, 4:3, stored under
// public/assets/gallery. Order here is the order on the page.
const PHOTOS = Array.from(
  { length: 9 },
  (_, i) => `/assets/gallery/before-after-${String(i + 1).padStart(2, "0")}.jpg`,
);

export function BeforeAfterCarousel() {
  const { t } = useLang();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(PHOTOS.length - 1, i));
    const slide = track.children[clamped] as HTMLElement | undefined;
    if (slide) track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setIndex(clamped);
  };

  // Keep the dots in step when the visitor swipes rather than using the arrows.
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(Math.max(0, Math.min(PHOTOS.length - 1, i)));
  };

  return (
    <div className="relative max-w-4xl mx-auto mt-10 md:mt-14">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-3xl shadow-lg [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {PHOTOS.map((src, i) => (
          <div key={src} className="snap-start shrink-0 w-full aspect-[4/3] bg-white">
            <LazyImage
              src={src}
              alt={`${t("gallery.alt")} ${i + 1}`}
              width={1024}
              height={768}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label={t("gallery.prev")}
        onClick={() => scrollTo(index - 1)}
        disabled={index === 0}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-sakura-green items-center justify-center shadow-lg disabled:opacity-0 transition-opacity">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        aria-label={t("gallery.next")}
        onClick={() => scrollTo(index + 1)}
        disabled={index >= PHOTOS.length - 1}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 text-sakura-green items-center justify-center shadow-lg disabled:opacity-0 transition-opacity">
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="flex justify-center gap-2 mt-5">
        {PHOTOS.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`${t("gallery.slide")} ${i + 1}`}
            onClick={() => scrollTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-sakura-green" : "w-2 bg-sakura-green/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
