import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Phone, Mail, Heart, Menu, X, MapPin, ChevronDown, Cookie } from "lucide-react";
import { BackgroundScene } from "./BackgroundScene";
import { CookieBanner } from "./CookieBanner";
import { WhatsAppButton } from "./WhatsAppButton";
import { CuraDomaLogo } from "./CuraDomaLogo";
import { requestReopenBanner } from "../../lib/consent";
import { useContent } from "../../lib/content";
import { Editable } from "./editor/Editable";
import { PhoneText, EmailText, AddressBlock } from "./editor/Shared";
import { Seo } from "./Seo";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const leistungenLinks = [
  { path: "/leistungen", label: "Alle Leistungen", id: "shared.leistungenmenu.0.label" },
  { path: "/entlastung", label: "Entlastungsleistungen", id: "shared.leistungenmenu.1.label" },
  { path: "/demenzbetreuung", label: "Demenz- & Seniorenbetreuung", id: "shared.leistungenmenu.2.label" },
  { path: "/haushaltsnahe-dienstleistungen", label: "Haushaltsnahe Dienstleistungen", id: "shared.leistungenmenu.3.label" },
  { path: "/verhinderungspflege", label: "Verhinderungspflege", id: "shared.leistungenmenu.4.label" },
  { path: "/umwandlung-sachleistungen", label: "Umwandlungsanspruch", id: "shared.leistungenmenu.5.label" },
];

const topNav = [
  { path: "/", label: "Startseite", id: "shared.nav.startseite" },
  { path: "/einzugsgebiet", label: "Einzugsgebiet", id: "shared.nav.einzugsgebiet" },
  { path: "/karriere", label: "Karriere", id: "shared.nav.karriere" },
  { path: "/kontakt", label: "Kontakt", id: "shared.nav.kontakt" },
  // { path: "/termin", label: "Termin vereinbaren", id: "shared.nav.termin_mobile" }, // TEMP deaktiviert – Termin-Bereich vorerst ausgeblendet
];

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getPages } = useContent();
  const extraPages = getPages().filter((p) => p.inMenu);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openMobileMenu = () => {
    window.clearTimeout(closeTimer.current);
    setMobileMenuMounted(true);
    setMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubOpen(false);
    window.clearTimeout(closeTimer.current);
    if (prefersReducedMotion()) {
      setMobileMenuMounted(false);
    } else {
      // keep the panel mounted until the slide-up/fade-out finishes
      closeTimer.current = window.setTimeout(() => setMobileMenuMounted(false), 240);
    }
  };

  const toggleMobileMenu = () => (mobileMenuOpen ? closeMobileMenu() : openMobileMenu());

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    window.clearTimeout(closeTimer.current);
    setMobileMenuOpen(false);
    setMobileMenuMounted(false);
    setMobileSubOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Scroll-reveal: elements tagged `.cura-reveal` fade/slide into view once
  // their top crosses into the lower viewport. A scroll-position sweep (rAF
  // throttled) is used instead of IntersectionObserver because IO can skip an
  // element during a fast fling or a programmatic jump and leave content
  // permanently hidden — the sweep also catches anything already scrolled past
  // and reveals everything once the page bottom is reached. Re-runs on route
  // change; respects reduced-motion.
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.querySelectorAll(".cura-reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    let raf = 0;
    const reveal = () => {
      raf = 0;
      const vh = window.innerHeight;
      const atBottom = window.scrollY + vh >= document.documentElement.scrollHeight - 2;
      document.querySelectorAll<HTMLElement>(".cura-reveal:not(.is-visible)").forEach((el) => {
        if (atBottom || el.getBoundingClientRect().top < vh * 0.88) {
          el.classList.add("is-visible");
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(reveal);
    };
    reveal(); // initial pass: reveal above-the-fold + anything already past
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isLeistungenActive = leistungenLinks.some((l) => location.pathname === l.path);

  // Each row in the mobile menu cascades in; delay is set per-item via inline style.
  const itemAnim = "motion-safe:animate-[curaMenuItem_300ms_cubic-bezier(0.22,1,0.36,1)_both]";

  return (
    <div
      className="min-h-screen bg-[#F8FEFF] text-[#111111] antialiased selection:bg-[#BFEAF2] selection:text-[#111111]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Seo />
      <BackgroundScene />

      {/* Top Utility Bar */}
      <div className="relative z-10 w-full bg-[#DFF7F8]/90 backdrop-blur-sm border-b border-[#BFEAF2]/50 py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center text-xs font-normal text-[#5F6B73]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-[#111111] transition-colors">
              <Phone size={16} strokeWidth={1.5} />
              <PhoneText id="shared.tel_display" />
            </span>
            <span className="flex items-center gap-1.5 hover:text-[#111111] transition-colors">
              <Mail size={16} strokeWidth={1.5} />
              <EmailText />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6FD3D1] font-normal">
            <Heart size={16} strokeWidth={1.5} />
            <Editable as="span" id="shared.utilitybar.slogan">Wir beraten Sie gerne kostenlos</Editable>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#E5F4F5] shadow-[0_4px_20px_rgb(191,234,242,0.15)] transition-all duration-300 ${scrolled ? "py-2" : "py-0"}`}>
        <div className={`max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6 transition-all duration-300 ${scrolled ? "h-20" : "h-24"}`}>
          <Link to="/" className="flex items-center transition-opacity hover:opacity-85 py-2 shrink-0" aria-label="Cura Doma — zur Startseite">
            <CuraDomaLogo animate className={`w-auto transition-all duration-300 ${scrolled ? "h-14 sm:h-16" : "h-16 sm:h-18 md:h-20"}`} />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className={`text-sm font-light transition-colors ${isActive("/") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              <Editable as="span" id="shared.nav.startseite">Startseite</Editable>
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 text-sm font-light transition-colors ${isLeistungenActive ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}
              >
                <Editable as="span" id="shared.nav.leistungen">Leistungen</Editable>
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_40px_rgb(191,234,242,0.4)] p-2 space-y-0.5">
                  {leistungenLinks.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      className={`cura-glow-item block px-4 py-2.5 rounded-xl text-sm font-light ${isActive(l.path) ? "bg-[#DFF7F8] text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}
                    >
                      <Editable as="span" id={l.id}>{l.label}</Editable>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/einzugsgebiet" className={`text-sm font-light transition-colors ${isActive("/einzugsgebiet") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              <Editable as="span" id="shared.nav.einzugsgebiet">Einzugsgebiet</Editable>
            </Link>
            <Link to="/karriere" className={`text-sm font-light transition-colors ${isActive("/karriere") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              <Editable as="span" id="shared.nav.karriere">Karriere</Editable>
            </Link>
            <Link to="/kontakt" className={`text-sm font-light transition-colors ${isActive("/kontakt") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              <Editable as="span" id="shared.nav.kontakt">Kontakt</Editable>
            </Link>
            {extraPages.map((p) => (
              <Link key={p.slug} to={`/${p.slug}`} className={`text-sm font-light transition-colors ${isActive(`/${p.slug}`) ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
                {p.label}
              </Link>
            ))}
            {/* TEMP deaktiviert – Termin-Bereich vorerst ausgeblendet
            <Link to="/termin" className={`text-sm font-light transition-colors ${isActive("/termin") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              <Editable as="span" id="shared.nav.termin">Termin</Editable>
            </Link>
            */}

            <Link
              to="/kontakt"
              className="text-sm font-light text-white bg-[#6FD3D1] hover:bg-[#5BC2C0] transition-colors rounded-full py-2.5 px-5 shadow-[0_4px_14px_rgb(111,211,209,0.3)]"
            >
              <Editable as="span" id="shared.nav.cta">Kostenlos beraten lassen</Editable>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-[#5F6B73]"
            aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMobileMenu}
          >
            <span className="relative block h-6 w-6">
              <Menu
                size={24}
                strokeWidth={1.5}
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
              />
              <X
                size={24}
                strokeWidth={1.5}
                className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
              />
            </span>
          </button>
        </div>

        {mobileMenuMounted && (
          <div
            id="mobile-menu"
            className={`lg:hidden bg-white border-t border-[#E5F4F5] px-6 py-4 space-y-2 max-h-[80vh] overflow-y-auto overflow-x-hidden origin-top ${
              mobileMenuOpen
                ? "motion-safe:animate-[curaMenuOpen_280ms_cubic-bezier(0.22,1,0.36,1)_both]"
                : "motion-safe:animate-[curaMenuClose_220ms_ease-in_both]"
            }`}
          >
            {topNav.slice(0, 1).map((link) => (
              <Link key={link.path} to={link.path} style={{ animationDelay: "40ms" }} className={`block py-2 text-sm font-light ${itemAnim} ${isActive(link.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                <Editable as="span" id={link.id}>{link.label}</Editable>
              </Link>
            ))}
            <button
              onClick={() => setMobileSubOpen(!mobileSubOpen)}
              style={{ animationDelay: "90ms" }}
              className={`flex items-center justify-between w-full py-2 text-sm font-light ${itemAnim} ${isLeistungenActive ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}
            >
              <Editable as="span" id="shared.nav.leistungen">Leistungen</Editable>
              <ChevronDown size={16} className={`transition-transform ${mobileSubOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileSubOpen && (
              <div className="pl-4 space-y-1 border-l border-[#E5F4F5] overflow-hidden motion-safe:animate-[curaSubIn_240ms_cubic-bezier(0.22,1,0.36,1)_both]">
                {leistungenLinks.map((l, i) => (
                  <Link key={l.path} to={l.path} style={{ animationDelay: `${i * 35}ms` }} className={`block py-2 text-sm font-light ${itemAnim} ${isActive(l.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                    <Editable as="span" id={l.id}>{l.label}</Editable>
                  </Link>
                ))}
              </div>
            )}
            {topNav.slice(1).map((link, i) => (
              <Link key={link.path} to={link.path} style={{ animationDelay: `${140 + i * 50}ms` }} className={`block py-2 text-sm font-light ${itemAnim} ${isActive(link.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                <Editable as="span" id={link.id}>{link.label}</Editable>
              </Link>
            ))}
            {extraPages.map((p, i) => (
              <Link key={p.slug} to={`/${p.slug}`} style={{ animationDelay: `${200 + i * 40}ms` }} className={`block py-2 text-sm font-light ${itemAnim} ${isActive(`/${p.slug}`) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                {p.label}
              </Link>
            ))}
            <Link to="/kontakt" style={{ animationDelay: "290ms" }} className={`block mt-3 text-sm font-light text-white bg-[#6FD3D1] rounded-full py-2.5 px-6 text-center ${itemAnim}`}>
              <Editable as="span" id="shared.nav.cta">Kostenlos beraten lassen</Editable>
            </Link>
          </div>
        )}
      </nav>

      <main className="relative z-10 overflow-x-clip">
        <Outlet />
      </main>

      <footer className="relative z-10 bg-[#F8FEFF]/95 backdrop-blur-sm border-t border-[#E5F4F5] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <Link to="/" className="inline-flex items-center mb-6" aria-label="Cura Doma — zur Startseite">
                <CuraDomaLogo className="h-24 sm:h-28 md:h-32 w-auto" />
              </Link>
              <p className="text-sm text-[#5F6B73] leading-relaxed font-light max-w-sm">
                <Editable as="span" id="shared.footer.description">Ihr würdevoller, ambulanter Betreuungsdienst. Wir unterstützen Senioren und Pflegebedürftige dabei, sicher und umsorgt im eigenen Zuhause zu leben.</Editable>
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-medium mb-4" style={jakarta}><Editable as="span" id="shared.footer.leistungen.heading">Leistungen</Editable></h4>
              <ul className="space-y-3 text-sm text-[#5F6B73] font-light">
                {leistungenLinks.map((l) => (
                  <li key={l.path}><Link to={l.path} className="hover:text-[#6FD3D1] transition-colors"><Editable as="span" id={l.id}>{l.label}</Editable></Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[#111111] font-medium mb-4" style={jakarta}><Editable as="span" id="shared.footer.kontakt.heading">Kontakt</Editable></h4>
              <ul className="space-y-3 text-sm text-[#5F6B73] font-light">
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <PhoneText className="hover:text-[#6FD3D1] transition-colors" />
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <EmailText className="hover:text-[#6FD3D1] transition-colors" />
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <a href="https://www.google.com/maps/search/?api=1&query=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany" target="_blank" rel="noopener noreferrer" className="hover:text-[#6FD3D1] transition-colors"><AddressBlock variant="br" /></a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5F4F5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#5F6B73] font-light"><Editable as="span" id="shared.footer.copyright">© 2026 Cura Doma. Alle Rechte vorbehalten.</Editable></p>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#5F6B73] font-light">
              <Link to="/impressum" className="hover:text-[#6FD3D1] transition-colors"><Editable as="span" id="shared.footer.impressum">Impressum</Editable></Link>
              <Link to="/datenschutz" className="hover:text-[#6FD3D1] transition-colors"><Editable as="span" id="shared.footer.datenschutz">Datenschutz</Editable></Link>
              <button
                type="button"
                onClick={() => requestReopenBanner()}
                aria-label="Cookie-Einstellungen öffnen"
                title="Cookie-Einstellungen"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#5F6B73] hover:text-[#6FD3D1] hover:bg-[#F8FEFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FD3D1] transition-colors"
              >
                <Cookie size={16} strokeWidth={1.7} />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E5F4F5] text-center">
            {/* Bewusst NICHT editierbar (kein <Editable>): der Axion-Studio-Credit
                soll fest bleiben und darf im Editor nicht geaendert werden. */}
            <p className="text-xs text-[#9AA3A8] font-light">
              Designed by{" "}
              <a
                href="https://axion-studio.de/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6FD3D1] hover:text-[#5BC2C0] transition-colors font-normal"
              >
                Axion Studio
              </a>
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
      <CookieBanner />

      <style>{`
        @keyframes curaMenuOpen {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes curaMenuClose {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-8px); }
        }
        @keyframes curaMenuItem {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes curaSubIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* Menu item glow: on hover the field lights up with a flowing
           teal→cyan brand gradient border + soft glow (same colour family
           as the BorderGlow cards on /leistungen). Hover-only, so touch
           devices are unaffected. */
        @keyframes curaGlowFlow {
          to { background-position: 200% 50%; }
        }
        .cura-glow-item,
        .cura-card-glow {
          position: relative;
          isolation: isolate;
          transition: color 0.25s ease, background-color 0.25s ease, box-shadow 0.35s ease;
        }
        .cura-glow-item::before,
        .cura-card-glow::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(110deg, #46CFCB, #84E3DD, #33C4D6, #84E3DD, #46CFCB);
          background-size: 200% 100%;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .cura-glow-item:hover::before,
        .cura-card-glow:hover::before {
          opacity: 1;
          animation: curaGlowFlow 3s linear infinite;
        }
        .cura-glow-item:hover {
          box-shadow: 0 0 18px -3px rgba(70, 207, 203, 0.5), 0 2px 10px rgba(111, 211, 209, 0.28);
        }
        .cura-card-glow:hover {
          box-shadow: 0 0 26px -4px rgba(70, 207, 203, 0.42), 0 14px 34px rgba(191, 234, 242, 0.55);
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-glow-item:hover::before,
          .cura-card-glow:hover::before { animation: none; }
        }
        /* Scroll-reveal: elements start at opacity 0 (in place — no transform,
           so nothing can shift the layout). When the IntersectionObserver adds
           .is-visible, a one-shot animation fades + slides them into view.
           Direction picks the entry side (left/right for side-by-side layouts,
           up for centered / full-width). Using an animation (not a transition)
           keeps the element's own hover transitions untouched. On stacked
           layouts (< lg) left/right fall back to a vertical slide so a
           horizontal offset can never cause sideways scrolling. */
        .cura-reveal { opacity: 0; }
        .cura-reveal.is-visible { animation: curaRevealUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .cura-reveal-left.is-visible  { animation-name: curaRevealLeft; }
        .cura-reveal-right.is-visible { animation-name: curaRevealRight; }
        @keyframes curaRevealUp    { from { opacity: 0; transform: translate3d(0, 34px, 0); }  to { opacity: 1; transform: none; } }
        @keyframes curaRevealLeft  { from { opacity: 0; transform: translate3d(-42px, 0, 0); } to { opacity: 1; transform: none; } }
        @keyframes curaRevealRight { from { opacity: 0; transform: translate3d(42px, 0, 0); }  to { opacity: 1; transform: none; } }
        /* On phones the same left/right slide is used, but with a LONGER travel
           and a slightly slower, smoother timing so the motion is clearly
           noticeable on a small screen. The horizontal offset is clipped by
           overflow-x-clip on <main>, so it never causes sideways scrolling. */
        @media (max-width: 1023px) {
          .cura-reveal.is-visible { animation-duration: 0.95s; }
          @keyframes curaRevealUp    { from { opacity: 0; transform: translate3d(0, 52px, 0); }  to { opacity: 1; transform: none; } }
          @keyframes curaRevealLeft  { from { opacity: 0; transform: translate3d(-56px, 0, 0); } to { opacity: 1; transform: none; } }
          @keyframes curaRevealRight { from { opacity: 0; transform: translate3d(56px, 0, 0); }  to { opacity: 1; transform: none; } }
        }
        @media (prefers-reduced-motion: reduce) {
          .cura-reveal { opacity: 1 !important; }
          .cura-reveal.is-visible { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
