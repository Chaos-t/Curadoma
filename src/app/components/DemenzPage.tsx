import { Link } from "react-router";
import {
  Sun, MessageCircle, Shield, Brain, Heart, Users, Clock,
  CheckCircle, Phone, BookOpen, Puzzle, HandHeart,
} from "lucide-react";
import { Editable } from "./editor/Editable";
import { EditableImage } from "./editor/EditableImage";

const jakarta = { fontFamily: "'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', sans-serif" };
const img1 = "https://images.unsplash.com/photo-1758691031958-29541f3207a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZ2l2ZXIlMjByZWFkaW5nJTIwYm9vayUyMHNlbmlvciUyMHdvbWFufGVufDF8fHx8MTc3NTMxNDAxNHww&ixlib=rb-4.1.0&q=80&w=1080";
const img2 = "https://images.unsplash.com/photo-1758691031197-fee3ccad4d68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW1lbnRpYSUyMGNhcmUlMjBlbGRlcmx5JTIwY29nbml0aXZlJTIwdGhlcmFweXxlbnwxfHx8fDE3NzUzMTQ0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

export function DemenzPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-white/80 to-[#F8FEFF]/80">
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#BFEAF2] opacity-15 rounded-full blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="cura-reveal cura-reveal-left flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DFF7F8] text-xs font-medium text-[#0E6E6A] mb-6 uppercase tracking-wider">
              <Editable as="span" id="demenz.hero.badge">Spezialisierte Betreuung</Editable>
            </div>
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#111111] leading-[1.15] mb-6" style={jakarta}>
              <Editable as="span" id="demenz.hero.title.line1">Senioren- und Demenzbetreuung</Editable> <br className="hidden lg:block" />
              <span className="text-[#0F7C77]"><Editable as="span" id="demenz.hero.title.line2">mit Herz und Verstand</Editable></span>
            </h1>
            <p className="text-lg text-[#5F6B73] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
              <Editable as="span" id="demenz.hero.subtitle">Demenz verändert das Leben – für Betroffene und ihre Angehörigen. Wir begleiten Sie auf diesem Weg mit Fachkompetenz, Einfühlungsvermögen und tiefer Menschlichkeit.</Editable>
            </p>
          </div>
          <div className="cura-reveal cura-reveal-right flex-1 w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(191,234,242,0.3)] border-4 border-white">
              <EditableImage id="demenz.hero.image" src={img1} alt="Betreuerin mit Seniorin" altId="demenz.hero.image.alt" className="w-full aspect-[4/3] object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Source Text */}
      <section className="py-20 bg-white/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 space-y-6 text-[17px] text-[#5F6B73] font-light leading-relaxed">
          <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-2" style={jakarta}>
            <Editable as="span" id="demenz.intro.title">Demenz und Seniorenbetreuung – Mit Herz und Kompetenz an Ihrer Seite</Editable>
          </h2>
          <p>
            <Editable as="span" id="demenz.intro.p1">Mit zunehmendem Alter stehen viele Menschen vor besonderen Herausforderungen – körperlich wie geistig. Eine der häufigsten Erkrankungen im Alter ist die Demenz. Sie verändert nicht nur das Leben der Betroffenen, sondern auch das ihrer Angehörigen. In dieser sensiblen Phase braucht es mehr als nur Betreuung – es braucht Verständnis, Geduld und fachliche Kompetenz.</Editable>
          </p>
          <p>
            <Editable as="span" id="demenz.intro.p2">Als anerkannter Betreuungsdienst haben wir es uns zur Aufgabe gemacht, Menschen mit Demenz sowie Seniorinnen und Senioren in ihrem Alltag individuell und würdevoll zu begleiten. Unser Ziel ist es, Lebensqualität zu erhalten und zu fördern – in der vertrauten Umgebung des eigenen Zuhauses.</Editable>
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-8" style={jakarta}><Editable as="span" id="demenz.leistungen.title">Unsere Leistungen im Überblick</Editable></h2>
          <ul className="space-y-4">
            {[
              { t: "Individuelle Alltagsbegleitung", d: "Unterstützung bei täglichen Aufgaben wie Kochen, Einkaufen oder der Freizeitgestaltung – angepasst an die persönlichen Bedürfnisse und Fähigkeiten." },
              { t: "Betreuung bei Demenz", d: "Unsere Betreuungskräfte sorgen für eine einfühlsame und strukturierte Begleitung, die Orientierung und Sicherheit bietet." },
              { t: "Entlastung für Angehörige", d: "Wir schaffen Freiräume für pflegende Angehörige durch verlässliche und flexible Betreuungszeiten." },
              { t: "Förderung sozialer Kontakte", d: "Durch gemeinsame Aktivitäten und Gespräche helfen wir, Isolation zu vermeiden und Lebensfreude zu erhalten." },
            ].map((item, i) => (
              <li key={i} className="cura-card-glow bg-white p-5 rounded-2xl border border-[#E5F4F5] flex gap-3">
                <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                <div>
                  <div className="text-base font-medium text-[#111111]" style={jakarta}><Editable as="span" id={`demenz.leistungen.${i}.title`}>{item.t}</Editable></div>
                  <div className="text-sm text-[#5F6B73] font-light mt-1 leading-relaxed"><Editable as="span" id={`demenz.leistungen.${i}.desc`}>{item.d}</Editable></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="cura-reveal cura-reveal-up max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
              <Editable as="span" id="demenz.ansatz.title">Unser Ansatz in der Demenzbetreuung</Editable>
            </h2>
            <p className="text-lg text-[#5F6B73] leading-relaxed font-light">
              <Editable as="span" id="demenz.ansatz.intro">Jeder Mensch mit Demenz hat eine einzigartige Geschichte. Wir nehmen uns Zeit, diese zu verstehen und unsere Betreuung darauf abzustimmen.</Editable>
            </p>
          </div>

          <div className="cura-reveal cura-reveal-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Sun size={28} strokeWidth={1.5} />, title: "Tagesstruktur & Orientierung", desc: "Feste Rhythmen und vertraute Rituale geben Sicherheit. Wir schaffen einen strukturierten Tagesablauf, der Halt bietet." },
              { icon: <MessageCircle size={28} strokeWidth={1.5} />, title: "Biografiearbeit", desc: "Wir knüpfen an Lebensgeschichten an, aktivieren positive Erinnerungen und schaffen Momente der Verbundenheit." },
              { icon: <Puzzle size={28} strokeWidth={1.5} />, title: "Gedächtnistraining", desc: "Spielerische Übungen, die kognitiv fordern, ohne zu überfordern. Angepasst an die individuellen Fähigkeiten." },
              { icon: <Heart size={28} strokeWidth={1.5} />, title: "Validation", desc: "Wir begegnen jedem Gefühl mit Akzeptanz und Wertschätzung. Die emotionale Welt wird respektiert und begleitet." },
              { icon: <HandHeart size={28} strokeWidth={1.5} />, title: "Emotionale Begleitung", desc: "Bei Ängsten, Unruhe oder Verwirrtheit sind wir da – ruhig, geduldig und mit einer beruhigenden Präsenz." },
              { icon: <Shield size={28} strokeWidth={1.5} />, title: "Sicherheit im Alltag", desc: "Wir achten auf potenzielle Gefahren und helfen, das Zuhause sicher zu gestalten, ohne die Selbstständigkeit einzuschränken." },
            ].map((item, i) => (
              <div key={i} className="cura-card-glow bg-[#F8FEFF]/80 backdrop-blur-sm p-8 rounded-3xl border border-[#E5F4F5] hover:shadow-md transition-shadow duration-300">
                <div className="w-14 h-14 bg-[#DFF7F8] rounded-2xl flex items-center justify-center text-[#0E6E6A] mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium tracking-tight text-[#111111] mb-3" style={jakarta}><Editable as="span" id={`demenz.ansatz.${i}.title`}>{item.title}</Editable></h3>
                <p className="text-[15px] text-[#5F6B73] leading-relaxed font-light"><Editable as="span" id={`demenz.ansatz.${i}.desc`}>{item.desc}</Editable></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Families */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="cura-reveal cura-reveal-left">
            <h2 className="text-3xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
              <Editable as="span" id="demenz.angehoerige.title">Unterstützung auch für Angehörige</Editable>
            </h2>
            <p className="text-lg text-[#5F6B73] leading-relaxed font-light mb-6">
              <Editable as="span" id="demenz.angehoerige.intro">Die Pflege eines Menschen mit Demenz ist eine große Herausforderung. Angehörige stoßen oft an ihre Grenzen – körperlich und emotional. Wir sind auch für Sie da.</Editable>
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { title: "Entlastungsstunden", desc: "Verlässliche Betreuungszeiten, in denen Sie neue Kraft schöpfen können." },
                { title: "Beratung & Schulung", desc: "Wir erklären Ihnen den Umgang mit typischen Verhaltensweisen und geben praktische Tipps." },
                { title: "Emotionaler Beistand", desc: "Manchmal braucht man jemanden, der zuhört und versteht. Wir sind dieser Ansprechpartner." },
                { title: "Flexible Betreuungszeiten", desc: "Ob regelmäßig oder bei akutem Bedarf – wir passen uns Ihrem Rhythmus an." },
              ].map((item, i) => (
                <li key={i} className="cura-card-glow flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E5F4F5]">
                  <CheckCircle size={20} className="text-[#6FD3D1] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-base font-medium text-[#111111]"><Editable as="span" id={`demenz.angehoerige.${i}.title`}>{item.title}</Editable></div>
                    <div className="text-sm text-[#5F6B73] font-light mt-1"><Editable as="span" id={`demenz.angehoerige.${i}.desc`}>{item.desc}</Editable></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="cura-reveal cura-reveal-right relative">
            <div className="rounded-3xl overflow-hidden">
              <EditableImage id="demenz.angehoerige.image" src={img2} alt="Demenzbetreuung" altId="demenz.angehoerige.image.alt" className="w-full aspect-square object-cover rounded-3xl" />
            </div>
            <div className="absolute inset-0 bg-[#BFEAF2] opacity-10 rounded-3xl mix-blend-multiply"></div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="py-24 bg-white/80">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Brain size={48} strokeWidth={1} className="text-[#BFEAF2] mb-6 mx-auto" />
          <h2 className="cura-reveal cura-reveal-up text-3xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
            <Editable as="span" id="demenz.qualifikation.title">Fachlich geschult, menschlich überzeugt</Editable>
          </h2>
          <p className="cura-reveal cura-reveal-up text-lg text-[#5F6B73] leading-relaxed font-light mb-12">
            <Editable as="span" id="demenz.qualifikation.intro">Unsere Betreuungskräfte sind speziell für die Arbeit mit demenziell veränderten Menschen geschult. Regelmäßige Fortbildungen stellen sicher, dass wir stets nach aktuellen Erkenntnissen arbeiten.</Editable>
          </p>
          <div className="cura-reveal cura-reveal-up grid grid-cols-1 gap-6 max-w-sm mx-auto">
            {[
              { num: "100%", label: "Herz bei jeder Begegnung" },
            ].map((stat, i) => (
              <div key={i} className="cura-card-glow bg-[#F8FEFF] p-6 rounded-2xl border border-[#E5F4F5]">
                <div className="text-3xl font-medium text-[#0F7C77] mb-2" style={jakarta}><Editable as="span" id={`demenz.qualifikation.${i}.num`}>{stat.num}</Editable></div>
                <div className="text-sm text-[#5F6B73] font-light"><Editable as="span" id={`demenz.qualifikation.${i}.label`}>{stat.label}</Editable></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#F8FEFF]/80">
        <div className="cura-reveal cura-reveal-up max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-[#111111] mb-6" style={jakarta}>
            <Editable as="span" id="demenz.cta.title">Wir sind für Sie und Ihre Liebsten da</Editable>
          </h2>
          <p className="text-lg text-[#5F6B73] font-light mb-10 max-w-2xl mx-auto">
            <Editable as="span" id="demenz.cta.text">Lassen Sie uns gemeinsam einen Weg finden, der Geborgenheit, Sicherheit und Lebensfreude schenkt. Kontaktieren Sie uns für ein unverbindliches Gespräch.</Editable>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/kontakt" className="w-full sm:w-auto bg-[#0F7C77] text-white hover:bg-[#0E6E6A] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center gap-2 shadow-sm">
              <Phone size={20} /> <Editable as="span" id="demenz.cta.button-primary">Kostenloses Beratungsgespräch</Editable>
            </Link>
            <Link to="/leistungen" className="w-full sm:w-auto bg-white text-[#5F6B73] border border-[#E5F4F5] hover:bg-[#F8FEFF] px-8 py-4 rounded-full text-base font-normal transition-all flex items-center justify-center">
              <Editable as="span" id="demenz.cta.button-secondary">Alle Leistungen ansehen</Editable>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
