import { EinzugsgebietSection } from "./EinzugsgebietSection";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

export function EinzugsgebietPage() {
  return (
    <>
      <section className="relative pt-16 pb-12 lg:pt-24 bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#6FD3D1] mb-6 uppercase tracking-wider">
            Einzugsgebiet
          </div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
            Wo wir <span className="text-[#6FD3D1]">für Sie da sind</span>
          </h1>
          <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
            Unser Betreuungsdienst ist im Raum Springe, Hameln, Paderborn und Umgebung für Sie da. Wir bieten unsere Leistungen in zahlreichen Städten, Gemeinden und Ortsteilen der Region an, um eine wohnortnahe und verlässliche Betreuung sicherzustellen.
          </p>
        </div>
      </section>
      <EinzugsgebietSection heading={false} />
    </>
  );
}
