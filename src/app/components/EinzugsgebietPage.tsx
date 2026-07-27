import { EinzugsgebietSection } from "./EinzugsgebietSection";
import { Editable } from "./editor/Editable";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function EinzugsgebietPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
            <Editable as="span" id="einzugsgebiet.hero.badge">Einzugsgebiet</Editable>
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            <Editable as="span" id="einzugsgebiet.hero.title">Wo wir</Editable>{" "}
            <span className="text-[#0F7C77]"><Editable as="span" id="einzugsgebiet.hero.title.span">für Sie da sind</Editable></span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            <Editable as="span" id="einzugsgebiet.hero.intro">Unser Betreuungsdienst ist im Raum Springe, Hameln, Paderborn und Umgebung für Sie da. Wir bieten unsere Leistungen in zahlreichen Städten, Gemeinden und Ortsteilen der Region an, um eine wohnortnahe und verlässliche Betreuung sicherzustellen.</Editable>
          </p>
        </div>
      </section>
      {/* Nur fuer Screenreader: die Sektion rendert ihre eigene h2 nicht
          (heading={false}), sonst spraenge die Gliederung h1 -> h3. */}
      <h2 className="sr-only">Unsere Standorte und Orte im Einzugsgebiet</h2>
      <EinzugsgebietSection heading={false} />
    </>
  );
}
