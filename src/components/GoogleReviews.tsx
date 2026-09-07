import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useLang } from "../contexts/LanguageContext";

interface ReviewsPayload {
  configured: boolean;
  error?: boolean;
  rating: number | null;
  total: number;
  url: string | null;
}

// Shared so the request is made once per page load. Keyed by language: the
// endpoint localises its response, even though only the rating is shown today.
const pending = new Map<string, Promise<ReviewsPayload | null>>();
function loadReviews(lang: string) {
  if (!pending.has(lang)) {
    pending.set(
      lang,
      fetch(`/api/reviews?lang=${lang}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .catch(() => null),
    );
  }
  return pending.get(lang)!;
}

function useGoogleReviews() {
  const { lang } = useLang();
  const [data, setData] = useState<ReviewsPayload | null>(null);
  useEffect(() => {
    let alive = true;
    loadReviews(lang).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, [lang]);
  return data;
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

/**
 * Compact rating badge sitting on the hero photo. Solid rather than blurred: a
 * backdrop-filter over a scrolling background image is the same thing that
 * janked the sticky header on phones.
 */
export function GoogleRatingBadge() {
  const { lang } = useLang();
  const data = useGoogleReviews();

  if (!data?.configured || typeof data.rating !== "number") return null;

  const badge = (
    <span className="inline-flex items-center gap-3 bg-white/95 rounded-2xl px-5 py-3 shadow-xl">
      <GoogleWordmark />
      <span className="font-bold text-[#1A1A1A] text-lg leading-none">
        {data.rating.toFixed(1).replace(".", lang === "cs" ? "," : ".")}
      </span>
      <Stars value={data.rating} className="w-[18px] h-[18px]" />
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="mt-8">
      {data.url ? (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:scale-[1.02] transition-transform">
          {badge}
        </a>
      ) : (
        badge
      )}
    </motion.div>
  );
}
