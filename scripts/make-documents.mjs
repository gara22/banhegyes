// Renders the fictional parody documents to public/dokumentumok/*.pdf (+ first-page .png preview).
// Run manually after editing: node scripts/make-documents.mjs
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const OUT = new URL("../public/dokumentumok/", import.meta.url).pathname;

const docs = [
  {
    slug: "kerelem-kut-megszuntetes",
    heading: "Kérelem kút képzeletbeli megszüntetéséhez",
    ref: "Iktatószám: PARÓDIA/0001/2026",
    paragraphs: [
      "Alulírott kérelmezem, hogy a hivatal szíveskedjék megszüntetni azt a kutat, amely nincs.",
      "A kút helye: a kert hátsó részén, ahol még nem ástak. A kút mélysége: nincs, de ha lenne, akkor is szeretném, ha megszűnne.",
    ],
    fields: [
      "Kérelmező neve: ____________________",
      "Kút fajtája (kérjük aláhúzni): ásott / fúrt / elképzelt / szóbeszéd",
      "Kelt: ____________________  Aláírás: ____________________",
    ],
  },
  {
    slug: "kerelem-kut-letesites",
    heading: "Kérelem kút szimbolikus létesítéséhez",
    ref: "Iktatószám: PARÓDIA/0002/2026",
    paragraphs: [
      "A kérelem tárgya egy kizárólag jelképes kút létesítése. A kút nem ad vizet, de ad egy jó érzést, és ez a hivatalnak elég.",
      "Mellékelni kell egy rajzot a kútról, valamint egy másikat arról, hogy a kérelmező szerint hogyan néz ki a kút rajza.",
    ],
    fields: [
      "Kérelmező neve: ____________________",
      "A jelképes kút átmérője (cm): ______",
      "Kelt: ____________________  Aláírás: ____________________",
    ],
  },
  {
    slug: "tajekoztatas-kutak",
    heading: "Tájékoztatás a nem létező kutak engedélyeztetéséről",
    ref: "Iktatószám: PARÓDIA/0003/2026",
    paragraphs: [
      "A hivatal tájékoztatja a lakosságot, hogy a nem létező kutak engedélyeztetése továbbra is ingyenes, és továbbra sem szükséges hozzá semmi.",
      "Az engedélyezési eljárás három szakaszból áll: megfontolás, újragondolás és egy hosszú, csendes bólintás. Az eljárás végén a kút továbbra sem létezik, de hivatalosan is tudunk róla.",
      "Ez a dokumentum kitalált, nem hivatalos, és kizárólag szórakoztatási célt szolgál.",
    ],
    fields: [],
  },
  {
    slug: "kerelem-kut-fennmaradas",
    heading: "Kérelem kút üzemeltetési és fennmaradási engedélyhez",
    ref: "Iktatószám: PARÓDIA/0004/2026",
    paragraphs: [
      "Kérem, hogy a hivatal engedélyezze egy olyan kút további fennmaradását, amelyről mindenki tudja, hogy nem működik, de senki nem meri kimondani.",
    ],
    fields: [
      "Kérelmező neve: ____________________",
      "A kút állapota: reménytelenül optimista",
      "Kelt: ____________________  Aláírás: ____________________",
    ],
  },
  {
    slug: "arveres-hirdetmeny-2026",
    heading: "Árverési hirdetmény – egy használt főtér",
    ref: "Hirdetmény száma: PARÓDIA/1295/2026",
    paragraphs: [
      "A hivatal nyilvános árverésen értékesíti az alábbi, részben létező ingatlant: egy főteret, kevés repedéssel, egy szökőkúttal (hétfői napokon üzemel) és egy padsorral, amelyből három pad hiányzik, de a hiány eredeti állapotú.",
      "Kikiáltási ár: 1 db jól sikerült paprika és egy fél kosár hála. Az árverést a hivatal udvarán tartják, rossz idő esetén a hivatal belsejében, nagyon rossz idő esetén gondolatban.",
      "Az árverésen való részvétel kitalált, a hirdetmény nem valódi, ingatlant nem lehet vásárolni.",
    ],
    fields: [],
  },
  {
    slug: "allashirdetes-kirendeltseg-2024",
    heading: "Álláspályázat – Kirendeltség-vezető",
    ref: "Pályázat száma: PARÓDIA/0826/2024",
    paragraphs: [
      "A hivatal pályázatot hirdet a még fel nem állított kirendeltség vezetői beosztásának betöltésére.",
      "Elvárások: kiváló kommunikációs készség, jó fizikai állapot (a kirendeltség ajtaja nehéz), valamint a hiányzó kirendeltség iránti őszinte rajongás.",
      "Ez az álláshirdetés kitalált, nem valódi, jelentkezni nem lehet.",
    ],
    fields: [],
  },
  {
    slug: "kozmeghallgatas-meghivo-2025",
    heading: "Meghívó közmeghallgatásra",
    ref: "Meghívó száma: PARÓDIA/1003/2025",
    paragraphs: [
      "A polgármester tisztelettel meghívja a lakosságot a soron következő közmeghallgatásra, amelynek témája a nagy kerti törpe-kérdés.",
      "Napirend: 1. Megnyitó és köszöntés. 2. A törpék jelenlegi helyzete. 3. Törpék és kerítések. 4. Egyebek, ide értve a felszólalók egyéb panaszait is.",
      "A rendezvény kitalált, helyszíne és ideje nem valós.",
    ],
    fields: [],
  },
  {
    slug: "rendelet-9-2025",
    heading: "9/2025. (III.14.) önkormányzati rendelet",
    ref: "A szomszédos falu iránti kölcsönös szimpátia szabályairól",
    paragraphs: [
      "1. § A község lakói a szomszédos falu lakóit legalább évente egyszer egy mosollyal köszöntik.",
      "2. § A mosoly legalább három másodpercig tart, és nem lehet ironikus.",
      "3. § Ez a rendelet kitalált, jogi hatálya nincs, és semmilyen valós jogszabályt nem módosít.",
    ],
    fields: [],
  },
  {
    slug: "tajekoztato-szolgaltatovaltas-2023",
    heading: "Tájékoztató szolgáltatóváltásról",
    ref: "Tájékoztató száma: PARÓDIA/1201/2023",
    paragraphs: [
      "Tájékoztatjuk a tisztelt lakosságot, hogy a közterületek felületeit kiszolgáló szolgáltató személye megváltozik. Az új szolgáltató neve egyelőre titkos, de a hivatal szerint nagyon szimpatikus.",
      "A váltás a lakosok számára semmilyen teendőt nem jelent, kivéve ha valaki szeretne.",
      "Ez a tájékoztató kitalált, valós szolgáltatóra vagy változásra nem vonatkozik.",
    ],
    fields: [],
  },
];

const html = (
  d,
) => `<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 0 }
  html, body { margin: 0; width: 595px; height: 842px; }
  body { font: 13px/1.5 Georgia, 'Times New Roman', serif; color: #222; background: #fff; position: relative; overflow: hidden; }
  .page { padding: 50px 56px; }
  .head { text-align: center; border-bottom: 2px double #3f3013; padding-bottom: 10px; margin-bottom: 26px; }
  .head small { display: block; letter-spacing: .12em; font-size: 10px; }
  .head b { font-size: 16px; letter-spacing: .06em; }
  h1 { font-size: 17px; text-align: center; margin: 24px 0 6px; }
  .ref { text-align: center; font-style: italic; margin-bottom: 22px; }
  p { margin: 0 0 12px; text-align: justify; }
  .fields p { margin-top: 18px; }
  .stamp { position: absolute; left: 50%; top: 55%; transform: translate(-50%, -50%) rotate(-24deg); border: 4px solid rgba(179, 38, 30, .55); color: rgba(179, 38, 30, .55); padding: 6px 18px; font: bold 22px Arial, sans-serif; text-align: center; white-space: nowrap; }
</style></head><body>
  <div class="page">
    <div class="head"><small>KITALÁLT, NEM HIVATALOS DOKUMENTUM</small><b>NAGYBÁNHEGYES KÖZSÉG (PARÓDIA)</b></div>
    <h1>${d.heading}</h1>
    <div class="ref">${d.ref}</div>
    ${d.paragraphs.map((p) => `<p>${p}</p>`).join("")}
    <div class="fields">${d.fields.map((f) => `<p>${f}</p>`).join("")}</div>
  </div>
  <div class="stamp">PARÓDIA – NEM VALÓDI DOKUMENTUM</div>
</body></html>`;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 595, height: 842 } });
for (const d of docs) {
  await page.setContent(html(d), { waitUntil: "load" });
  await page.pdf({
    path: `${OUT}${d.slug}.pdf`,
    width: "595px",
    height: "842px",
    printBackground: true,
  });
  await page.screenshot({ path: `${OUT}${d.slug}.png` });
  console.log("wrote", d.slug);
}
await browser.close();
