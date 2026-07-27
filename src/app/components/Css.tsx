/**
 * Gibt CSS als <style> aus — und zwar ROH.
 *
 * WARUM NICHT die uebliche Schreibweise mit CSS als Kind-Text:
 * Beim Vorab-Rendern (SSG) maskiert renderToString den Text-Inhalt: aus einem
 * Anfuehrungszeichen wird &quot;, aus & wird &amp; usw. Der Browser dekodiert
 * das im <style>-Element aber NICHT (CSS ist dort Rohtext). Server-HTML und
 * Client-Render unterscheiden sich damit, React bricht die Hydration ab
 * (Fehler #418) und baut die ganze Seite neu auf — womit der Sinn des
 * Vorab-Renderns verloren geht. Genau das passierte hier durch ein
 * Anfuehrungszeichen in einem CSS-Kommentar.
 *
 * dangerouslySetInnerHTML ist hier unbedenklich: der Inhalt sind fest im Code
 * stehende CSS-Zeichenketten (Typ `string`), niemals Nutzereingaben.
 *
 * REGEL: Inline-CSS in Komponenten immer ueber <Css> ausgeben.
 */
export function Css({ children }: { children: string }) {
  return <style dangerouslySetInnerHTML={{ __html: children }} />;
}
