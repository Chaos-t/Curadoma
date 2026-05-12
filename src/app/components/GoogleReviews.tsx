// Google Reviews section for the home page.
//
// Visual: review cards scroll continuously right-to-left as a marquee.
// Hover (desktop) pauses the marquee so the reader can finish a review.
// On mobile we drop the marquee speed and let the user swipe instead.
//
// Data source: src/lib/reviews-data.ts — currently placeholder data.
// See that file's comments for the two ways to wire up REAL reviews
// (manual paste vs Google Places API).

import { Star, Quote } from "lucide-react";
import { reviews, reviewSummary } from "../../lib/reviews-data";

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

function ReviewCard({ r }: { r: typeof reviews[number] }) {
  return (
    <article className="cura-review-card relative shrink-0 w-[300px] sm:w-[360px] bg-white rounded-3xl border border-[#E5F4F5] shadow-[0_8px_24px_rgb(191,234,242,0.25)] p-6">
      <Quote
        size={28}
        className="absolute -top-3 left-6 text-[#BFEAF2] bg-white rounded-full p-1"
        strokeWidth={2}
      />
      <header className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#DFF7F8] to-[#BFEAF2] flex items-center justify-center text-[#6FBDB8] font-medium text-base shrink-0"
          style={jakarta}
        >
          {r.initial}
        </div>
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
            {r.location && <span>· {r.location}</span>}
          </div>
        </div>
      </header>
      <p className="text-[14px] text-[#5F6B73] font-light leading-relaxed">
        „{r.text}"
      </p>
    </article>
  );
}

export function GoogleReviews() {
  const hasPlaceholders = reviews.some((r) => r.isPlaceholder);
  // Duplicate the list so the marquee can loop seamlessly
  const loop = [...reviews, ...reviews];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <div className="text-center max-w-2xl mx-auto">
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
              {reviewSummary.average.toFixed(1)}
            </span>
            <div className="flex flex-col items-start">
              <Stars value={Math.round(reviewSummary.average)} />
              <span className="text-xs text-[#5F6B73] font-light mt-0.5">
                aus {reviewSummary.count} Bewertungen
              </span>
            </div>
          </div>
          <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed mt-4">
            Was Angehörige und pflegebedürftige Menschen über unsere Arbeit
            sagen.
          </p>
        </div>

        {hasPlaceholders && (
          <div className="mt-6 mx-auto max-w-xl rounded-2xl border border-[#FFE4B5] bg-[#FFF8E7] px-4 py-3 text-xs text-[#8A6A2A] font-medium text-center">
            ⚠ Beispiel-Bewertungen — bitte mit echten Google-Rezensionen
            ersetzen (siehe <code className="font-mono">src/lib/reviews-data.ts</code>).
          </div>
        )}
      </div>

      {/* Marquee */}
      <div className="cura-reviews-marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="cura-reviews-track flex gap-5 px-6 py-6">
          {loop.map((r, i) => (
            <ReviewCard key={`${r.author}-${i}`} r={r} />
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
