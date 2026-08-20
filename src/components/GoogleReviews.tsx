import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, BadgeCheck } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

interface Review {
  author: string;
  avatar: string | null;
  profileUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

interface ReviewsPayload {
  configured: boolean;
  error?: boolean;
  rating: number | null;
  total: number;
  url: string | null;
  reviews: Review[];
}

function GoogleWordmark() {
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <span className="font-semibold tracking-tight" aria-label="Google">
      {letters.map(([ch, color], i) => (
        <span key={i} style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Five stars with the fractional part of `value` partially filled. */
function Stars({ value, className = "w-5 h-5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${className} text-gray-300`} fill="currentColor" />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}>
                <Star className={`${className} text-[#FBBC05]`} fill="currentColor" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function GoogleReviews() {
  const { t, lang } = useLang();
  const [data, setData] = useState<ReviewsPayload | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/reviews?lang=${lang}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((payload: ReviewsPayload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const reviews = data?.reviews ?? [];
  const hasRating = typeof data?.rating === "number";

  // Until the Places key is set up, or if Google is unreachable, render nothing
  // rather than an empty heading. A listing can also have plenty of star-only
  // ratings and no written ones — then the score is still worth showing, and
  // the carousel below simply appears once someone writes something.
  if (!data?.configured || (!hasRating && reviews.length === 0)) return null;

  const scrollTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(reviews.length - 1, i));
    const card = track.children[clamped] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setIndex(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    let nearest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const d = Math.abs((child as HTMLElement).offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    setIndex(nearest);
  };

  return (
    <section className="bg-sakura-cream py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl font-bold text-sakura-green text-center mb-10">
          {t("reviews.title")}
        </motion.h2>

        {/* Rating summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-sakura-pink/15 shadow-sm px-6 py-7 mb-6 text-center">
          <p className="text-xl md:text-2xl mb-3">
            <GoogleWordmark />{" "}
            <span className="text-[#1A1A1A] font-medium">{t("reviews.google")}</span>
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="text-3xl md:text-4xl font-bold text-[#1A1A1A]">
              {data.rating != null
                ? data.rating.toFixed(1).replace(".", lang === "cs" ? "," : ".")
                : "—"}
            </span>
            <Stars value={data.rating ?? 0} className="w-6 h-6 md:w-7 md:h-7" />
            <span className="text-gray-500 text-lg">({data.total})</span>
          </div>
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sakura-green hover:text-sakura-pink font-medium transition-colors">
              {t("reviews.viewAll")}
            </a>
          )}
        </motion.div>

        {/* Carousel — omitted entirely when the listing has only star ratings */}
        {reviews.length > 0 && (
        <div className="relative">
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {reviews.map((r, i) => (
              <article
                key={i}
                className="snap-start shrink-0 w-full md:w-[calc(50%-0.625rem)] bg-white rounded-3xl border border-sakura-pink/15 shadow-sm p-6 md:p-7">
                <div className="flex items-center gap-3 mb-4">
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <span className="w-11 h-11 rounded-full bg-sakura-cream text-sakura-green font-semibold flex items-center justify-center flex-shrink-0">
                      {r.author.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1A1A1A] flex items-center gap-1.5 truncate">
                      {r.author}
                      <BadgeCheck className="w-4 h-4 text-[#4285F4] flex-shrink-0" />
                    </p>
                    <p className="text-sm text-gray-500">{r.relativeTime}</p>
                  </div>
                </div>
                <Stars value={r.rating} className="w-4 h-4" />
                <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">
                  {r.text}
                </p>
              </article>
            ))}
          </div>

          {reviews.length > 1 && (
            <>
              <button
                type="button"
                aria-label={t("reviews.prev")}
                onClick={() => scrollTo(index - 1)}
                disabled={index === 0}
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-sakura-green text-white items-center justify-center shadow-lg disabled:opacity-30 transition-opacity">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                aria-label={t("reviews.next")}
                onClick={() => scrollTo(index + 1)}
                disabled={index >= reviews.length - 1}
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-sakura-green text-white items-center justify-center shadow-lg disabled:opacity-30 transition-opacity">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        )}

        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}`}
                onClick={() => scrollTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-sakura-green" : "w-2 bg-sakura-green/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
