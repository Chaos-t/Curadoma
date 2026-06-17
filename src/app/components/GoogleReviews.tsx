// Google Reviews section for the home page.
//
// Live data flow:
//   1. On mount, fetch `/reviews` from the Edge Function (which hits
//      Google Places Details API server-side, cached 6h in KV).
//   2. While the request is in flight, show a subtle loading state.
//   3. If real reviews come back: render them and link each to its
//      Google Maps author profile.
//   4. If the request fails / no Place ID set / network down: fall
//      back to the placeholders in src/lib/reviews-data.ts.
// Visitors keep the page tab open? Refresh every 30 minutes so a
// long-open tab eventually picks up new reviews.

import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { reviews as fallbackReviews, reviewSummary as fallbackSummary } from "../../lib/reviews-data";
import { projectId, publicAnonKey } from "/utils/supabase/info";

type LiveReview = {
  author_name: string;
  author_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url?: string;
  time: number;
};

type DisplayReview = {
  author: string;
  authorUrl?: string;
  rating: number;
  text: string;
  date: string;
  initial: string;
  photoUrl?: string;
  isPlaceholder: boolean;
};

function liveToDisplay(r: LiveReview): DisplayReview {
  return {
    author: r.author_name,
    authorUrl: r.author_url,
    rating: r.rating,
    text: r.text,
    date: r.relative_time_description,
    initial: (r.author_name.match(/\p{L}/u)?.[0] ?? "?").toUpperCase(),
    photoUrl: r.profile_photo_url,
    isPlaceholder: false,
  };
}

function placeholderToDisplay(r: typeof fallbackReviews[number]): DisplayReview {
  return {
    author: r.author,
    rating: r.rating,
    text: r.text,
    date: r.date,
    initial: r.initial,
    isPlaceholder: r.isPlaceholder,
  };
}

const REVIEWS_REFRESH_MS = 30 * 60 * 1000;

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} von 5 Sternen`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < value ? "text-[#F5B544] fill-[#F5B544]" : "text-[#E5F4F5]"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function GoogleG({ size = 16 }: { size?: number }) {
  // Inline four-colour Google "G" mark. Small + accessible.
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function ReviewCard({ r, placeUrl }: { r: DisplayReview; placeUrl?: string }) {
  // Click target: prefer the reviewer's profile URL (Google's pattern);
  // fall back to the place URL; otherwise the card is non-interactive.
  const href = r.authorUrl ?? placeUrl;
  const Body = (
    <>
      <Quote
        size={28}
        className="absolute -top-3 left-6 text-[#BFEAF2] bg-white rounded-full p-1"
        strokeWidth={2}
      />
      <header className="flex items-center gap-3 mb-4">
        {r.photoUrl ? (
          <img
            src={r.photoUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover bg-[#DFF7F8] shrink-0"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#DFF7F8] to-[#BFEAF2] flex items-center justify-center text-[#6FBDB8] font-medium text-base shrink-0"
            style={jakarta}
          >
            {r.initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium text-[#111111] truncate"
              style={jakarta}
            >
              {r.author}
            </span>
            <GoogleG size={14} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#9AA3A8] font-light">
            <Stars value={r.rating} />
            <span>· {r.date}</span>
          </div>
        </div>
      </header>
      <p className="text-[14px] text-[#5F6B73] font-light leading-relaxed line-clamp-6">
        „{r.text}"
      </p>
    </>
  );

  const cardClasses =
    "cura-review-card relative shrink-0 w-[300px] sm:w-[360px] bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_8px_24px_rgb(191,234,242,0.25)] p-6 transition-shadow";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClasses} hover:shadow-[0_14px_36px_rgb(191,234,242,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD3D1] cursor-pointer no-underline`}
        aria-label={`Bewertung von ${r.author} auf Google öffnen`}
      >
        {Body}
      </a>
    );
  }
  return <article className={cardClasses}>{Body}</article>;
}

export function GoogleReviews() {
  // displayReviews: what we actually render. summary: shown in the header.
  const [displayReviews, setDisplayReviews] = useState<DisplayReview[]>(() =>
    fallbackReviews.map(placeholderToDisplay),
  );
  const [summary, setSummary] = useState<{ average: number; count: number }>({
    average: fallbackSummary.average,
    count: fallbackSummary.count,
  });
  // Hardcoded canonical link to the Cura Doma listing on Google Maps,
  // used both as the fallback placeUrl AND as the per-card href when
  // a live review doesn't carry its own author_url.
  const [placeUrl, setPlaceUrl] = useState<string | undefined>(
    "https://www.google.com/maps?cid=7622881786460465372",
  );
  const [usingFallback, setUsingFallback] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ec6100a6/reviews`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } },
        );
        if (!res.ok) {
          // 503 (missing secrets) or 502 (upstream fail) → keep fallback
          console.log("/reviews returned", res.status);
          return;
        }
        const json = (await res.json()) as {
          reviews: LiveReview[];
          rating?: number;
          total?: number;
          placeUrl?: string;
        };
        if (cancelled) return;
        const live = (json.reviews ?? []).map(liveToDisplay);
        if (live.length > 0) {
          setDisplayReviews(live);
          setPlaceUrl(json.placeUrl);
          setSummary({
            average: json.rating ?? live.reduce((s, r) => s + r.rating, 0) / live.length,
            count: json.total ?? live.length,
          });
          setUsingFallback(false);
        }
      } catch (e) {
        console.log("/reviews fetch error:", e);
      }
    };

    load();
    const id = window.setInterval(load, REVIEWS_REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Duplicate the list so the marquee can loop seamlessly
  const loop = [...displayReviews, ...displayReviews];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <div className="cura-reveal cura-reveal-up text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5F4F5] text-xs font-medium text-[#5F6B73] mb-5 shadow-sm">
            <GoogleG size={14} /> Bewertungen auf Google
          </div>
          <h2
            className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4"
            style={jakarta}
          >
            Stimmen unserer Kundinnen und Kunden
          </h2>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span
              className="text-4xl font-medium text-[#111111]"
              style={jakarta}
            >
              {summary.average.toFixed(1)}
            </span>
            <div className="flex flex-col items-start">
              <Stars value={Math.round(summary.average)} />
              <span className="text-xs text-[#5F6B73] font-light mt-0.5">
                aus {summary.count} Bewertungen
              </span>
            </div>
          </div>
          <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mt-4">
            Was Angehörige und pflegebedürftige Menschen über unsere Arbeit
            sagen.
          </p>
          {placeUrl && (
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#6FD3D1] hover:text-[#5BC2C0]"
            >
              Alle Bewertungen auf Google ansehen →
            </a>
          )}
        </div>

{/* Static-data fallback is silent — the bundled reviews are the
            real ones, just not the always-fresh live API copy. */}
      </div>

      {/* Marquee */}
      <div className="cura-reviews-marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="cura-reviews-track flex gap-5 px-6 py-6">
          {loop.map((r, i) => (
            <ReviewCard key={`${r.author}-${i}`} r={r} placeUrl={placeUrl} />
          ))}
        </div>
      </div>

      <style>{`
        .cura-reviews-track {
          width: max-content;
          animation: cura-reviews-marquee 60s linear infinite;
        }
        .cura-reviews-marquee:hover .cura-reviews-track {
          animation-play-state: paused;
        }
        @keyframes cura-reviews-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-reviews-track { animation: none; }
          .cura-reviews-marquee {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .cura-review-card { scroll-snap-align: start; }
        }
        /* Mobile: speed up perception by halving travel time + enable
           swipe scrolling as a manual override. The marquee still runs
           in the background, but the user can grab and swipe. */
        @media (max-width: 767px) {
          .cura-reviews-marquee {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .cura-reviews-track { animation-duration: 45s; }
          .cura-review-card { scroll-snap-align: start; }
        }
      `}</style>
    </section>
  );
}
