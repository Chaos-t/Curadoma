// Instagram feed for the home page.
//
// Data flow mirrors GoogleReviews:
//   1. Fetch `/instagram-posts` from the Edge Function on mount.
//   2. Server side it hits Instagram Graph API (cached 30 min in KV).
//   3. Renders the posts as a right-to-left marquee on desktop /
//      swipe-snap row on mobile. Each card links to the permalink.
//   4. Re-fetches every 30 minutes so a long-open tab catches new posts.
//
// If the Supabase secrets INSTAGRAM_ACCESS_TOKEN +
// INSTAGRAM_BUSINESS_ACCOUNT_ID are not configured, the endpoint
// returns 503 and the entire section silently hides — so the page
// doesn't show an empty/broken state until the user wires up IG.

import { useEffect, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Editable } from "./editor/Editable";
import { useContent } from "../../lib/content";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

type IGPost = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

const REFRESH_MS = 30 * 60 * 1000;

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function captionExcerpt(caption: string | undefined, max = 110): string {
  if (!caption) return "";
  const stripped = caption.replace(/\s+/g, " ").trim();
  return stripped.length > max ? `${stripped.slice(0, max - 1).trim()}…` : stripped;
}

function PostCard({ post }: { post: IGPost }) {
  // Videos: media_url is the .mp4 — we show thumbnail_url as a still.
  const previewUrl =
    post.media_type === "VIDEO" && post.thumbnail_url ? post.thumbnail_url : post.media_url;
  const { get } = useContent();
  const altFallback = get("instagram.card.img-alt-fallback") ?? "Instagram-Beitrag";

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="cura-ig-card group relative shrink-0 w-[240px] sm:w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border border-[#E5F4F5] shadow-[0_8px_24px_rgb(191,234,242,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD3D1]"
      aria-label={`Instagram-Beitrag öffnen — ${formatDate(post.timestamp)}`}
    >
      <img
        src={previewUrl}
        alt={captionExcerpt(post.caption, 60) || altFallback}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      {/* Type badge */}
      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/45 backdrop-blur-sm text-white text-[10px] font-medium uppercase tracking-wider">
        <Instagram size={11} />
        {post.media_type === "VIDEO" ? (
          <Editable as="span" id="instagram.card.type-video">Video</Editable>
        ) : post.media_type === "CAROUSEL_ALBUM" ? (
          <Editable as="span" id="instagram.card.type-album">Album</Editable>
        ) : (
          <Editable as="span" id="instagram.card.type-photo">Foto</Editable>
        )}
      </span>

      {/* Click hint */}
      <span className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/85 text-[#5F6B73] opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={13} />
      </span>

      {/* Caption + date */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent p-4 pt-10">
        <p className="text-[13px] leading-snug text-white font-light line-clamp-3">
          {captionExcerpt(post.caption)}
        </p>
        <p className="text-[10px] text-white/70 mt-2 uppercase tracking-wider">
          {formatDate(post.timestamp)}
        </p>
      </div>
    </a>
  );
}

export function InstagramFeed() {
  const [posts, setPosts] = useState<IGPost[] | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null); // null = unknown

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ec6100a6/instagram-posts`,
          { headers: { Authorization: `Bearer ${publicAnonKey}` } },
        );
        if (!res.ok) {
          if (!cancelled) setAvailable(false);
          return;
        }
        const json = (await res.json()) as { posts: IGPost[] };
        if (cancelled) return;
        if (json.posts && json.posts.length > 0) {
          setPosts(json.posts);
          setAvailable(true);
        } else {
          setAvailable(false);
        }
      } catch (e) {
        console.log("/instagram-posts fetch error:", e);
        if (!cancelled) setAvailable(false);
      }
    };

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Don't render anything until we know whether IG is available.
  // If not available, hide the section entirely (no broken UI).
  if (available === false || !posts || posts.length === 0) {
    return null;
  }

  const loop = [...posts, ...posts];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <div className="cura-reveal cura-reveal-up text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5F4F5] text-xs font-medium text-[#5F6B73] mb-5 shadow-sm">
            <Instagram size={14} className="text-[#6FD3D1]" /> <Editable as="span" id="instagram.header.badge">Aktuelles aus dem Alltag</Editable>
          </div>
          <h2
            className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-4"
            style={jakarta}
          >
            <Editable as="span" id="instagram.header.title" style={jakarta}>Folgen Sie uns auf Instagram</Editable>
          </h2>
          <p className="text-[15px] text-[#5F6B73] font-light leading-relaxed">
            <Editable as="span" id="instagram.header.subtitle">Einblicke in unsere Arbeit, Aktionen und das Leben in der Cura-Doma-Familie.</Editable>
          </p>
        </div>
      </div>

      <div className="cura-ig-marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="cura-ig-track flex gap-4 px-6 py-4">
          {loop.map((p, i) => (
            <PostCard key={`${p.id}-${i}`} post={p} />
          ))}
        </div>
      </div>

      <style>{`
        .cura-ig-track {
          width: max-content;
          animation: cura-ig-marquee 75s linear infinite;
        }
        .cura-ig-marquee:hover .cura-ig-track {
          animation-play-state: paused;
        }
        @keyframes cura-ig-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-ig-track { animation: none; }
          .cura-ig-marquee {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .cura-ig-card { scroll-snap-align: start; }
        }
        @media (max-width: 767px) {
          .cura-ig-marquee {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .cura-ig-track { animation-duration: 50s; }
          .cura-ig-card { scroll-snap-align: start; }
        }
      `}</style>
    </section>
  );
}
