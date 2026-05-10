import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Phone, Mail, Heart, Menu, X, MapPin, ChevronDown } from "lucide-react";
import { WaveBackground } from "./WaveBackground";
import { CuraDomaLogo } from "./CuraDomaLogo";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const leistungenLinks = [
  { path: "/leistungen", label: "Alle Leistungen" },
  { path: "/entlastung", label: "Entlastungsleistungen" },
  { path: "/demenzbetreuung", label: "Demenz- & Seniorenbetreuung" },
  { path: "/haushaltsnahe-dienstleistungen", label: "Haushaltsnahe Dienstleistungen" },
  { path: "/verhinderungspflege", label: "Verhinderungspflege" },
  { path: "/umwandlung-sachleistungen", label: "Umwandlung in Sachleistungen" },
];

const topNav = [
  { path: "/", label: "Startseite" },
  { path: "/einzugsgebiet", label: "Einzugsgebiet" },
  { path: "/karriere", label: "Karriere" },
  { path: "/kontakt", label: "Kontakt" },
];

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSubOpen, setMobileSubOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
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

  return (
    <div
      className="min-h-screen bg-[#F8FEFF] text-[#111111] antialiased selection:bg-[#BFEAF2] selection:text-[#111111]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <WaveBackground />

      {/* Top Utility Bar */}
      <div className="relative z-10 w-full bg-[#DFF7F8]/90 backdrop-blur-sm border-b border-[#BFEAF2]/50 py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center text-xs font-normal text-[#5F6B73]">
          <div className="flex items-center gap-6">
            <a href="tel:+4951517107093" className="flex items-center gap-1.5 hover:text-[#111111] transition-colors">
              <Phone size={16} strokeWidth={1.5} />
              05151 7107093
            </a>
            <a href="mailto:info@curadoma.de" className="flex items-center gap-1.5 hover:text-[#111111] transition-colors">
              <Mail size={16} strokeWidth={1.5} />
              info@curadoma.de
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-[#6FD3D1] font-normal">
            <Heart size={16} strokeWidth={1.5} />
            Wir beraten Sie gerne kostenlos
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#E5F4F5] shadow-[0_4px_20px_rgb(191,234,242,0.15)] transition-all duration-300 ${scrolled ? "py-2" : "py-0"}`}>
        <div className={`max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6 transition-all duration-300 ${scrolled ? "h-20" : "h-24"}`}>
          <Link to="/" className="flex items-center transition-opacity hover:opacity-85 py-2 shrink-0" aria-label="Cura Doma — zur Startseite">
            <CuraDomaLogo className={`w-auto transition-all duration-300 ${scrolled ? "h-14 sm:h-16" : "h-16 sm:h-18 md:h-20"}`} />
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link to="/" className={`text-sm font-light transition-colors ${isActive("/") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              Startseite
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 text-sm font-light transition-colors ${isLeistungenActive ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}
              >
                Leistungen
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-white rounded-2xl border border-[#E5F4F5] shadow-[0_10px_40px_rgb(191,234,242,0.4)] overflow-hidden">
                  {leistungenLinks.map((l) => (
                    <Link
                      key={l.path}
                      to={l.path}
                      className={`block px-5 py-3 text-sm font-light transition-colors ${isActive(l.path) ? "bg-[#DFF7F8] text-[#6FD3D1]" : "text-[#5F6B73] hover:bg-[#F8FEFF] hover:text-[#6FD3D1]"}`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/einzugsgebiet" className={`text-sm font-light transition-colors ${isActive("/einzugsgebiet") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              Einzugsgebiet
            </Link>
            <Link to="/karriere" className={`text-sm font-light transition-colors ${isActive("/karriere") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              Karriere
            </Link>
            <Link to="/kontakt" className={`text-sm font-light transition-colors ${isActive("/kontakt") ? "text-[#6FD3D1]" : "text-[#5F6B73] hover:text-[#6FD3D1]"}`}>
              Kontakt
            </Link>

            <Link
              to="/kontakt"
              className="text-sm font-light text-white bg-[#6FD3D1] hover:bg-[#5BC2C0] transition-colors rounded-full py-2.5 px-5 shadow-[0_4px_14px_rgb(111,211,209,0.3)]"
            >
              Kostenlos beraten lassen
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-[#5F6B73]"
            aria-label="Menü öffnen"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5F4F5] px-6 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
            {topNav.slice(0, 1).map((link) => (
              <Link key={link.path} to={link.path} className={`block py-2 text-sm font-light ${isActive(link.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setMobileSubOpen(!mobileSubOpen)}
              className={`flex items-center justify-between w-full py-2 text-sm font-light ${isLeistungenActive ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}
            >
              Leistungen
              <ChevronDown size={16} className={`transition-transform ${mobileSubOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileSubOpen && (
              <div className="pl-4 space-y-1 border-l border-[#E5F4F5]">
                {leistungenLinks.map((l) => (
                  <Link key={l.path} to={l.path} className={`block py-2 text-sm font-light ${isActive(l.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
            {topNav.slice(1).map((link) => (
              <Link key={link.path} to={link.path} className={`block py-2 text-sm font-light ${isActive(link.path) ? "text-[#6FD3D1]" : "text-[#5F6B73]"}`}>
                {link.label}
              </Link>
            ))}
            <Link to="/kontakt" className="block mt-3 text-sm font-light text-white bg-[#6FD3D1] rounded-full py-2.5 px-6 text-center">
              Kostenlos beraten lassen
            </Link>
          </div>
        )}
      </nav>

      <main className="relative z-10">
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
                Ihr würdevoller, ambulanter Betreuungsdienst. Wir unterstützen Senioren und Pflegebedürftige dabei, sicher und umsorgt im eigenen Zuhause zu leben.
              </p>
            </div>

            <div>
              <h4 className="text-[#111111] font-medium mb-4" style={jakarta}>Leistungen</h4>
              <ul className="space-y-3 text-sm text-[#5F6B73] font-light">
                {leistungenLinks.map((l) => (
                  <li key={l.path}><Link to={l.path} className="hover:text-[#6FD3D1] transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[#111111] font-medium mb-4" style={jakarta}>Kontakt</h4>
              <ul className="space-y-3 text-sm text-[#5F6B73] font-light">
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <a href="tel:+4951517107093" className="hover:text-[#6FD3D1] transition-colors">05151 7107093</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <a href="mailto:info@curadoma.de" className="hover:text-[#6FD3D1] transition-colors">info@curadoma.de</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[#6FD3D1]" />
                  <a href="https://www.google.com/maps/search/?api=1&query=S%C3%BCntelhang+9%2C+31787+Hameln%2C+Germany" target="_blank" rel="noopener noreferrer" className="hover:text-[#6FD3D1] transition-colors">Süntelhang 9<br />31787 Hameln</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E5F4F5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#5F6B73] font-light">© 2026 Cura Doma. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6 text-xs text-[#5F6B73] font-light">
              <Link to="/impressum" className="hover:text-[#6FD3D1] transition-colors">Impressum</Link>
              <Link to="/datenschutz" className="hover:text-[#6FD3D1] transition-colors">Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
