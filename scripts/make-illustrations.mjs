// Generates the original SVG illustrations (sights + gallery). Run: node scripts/make-illustrations.mjs
import { mkdir, writeFile } from "node:fs/promises";

const ROOT = new URL("../public/img/", import.meta.url).pathname;

const rng = (seed) => () =>
  (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

function scene({
  w,
  h,
  seed,
  sky,
  ground,
  caption,
  sepia = false,
  bird = false,
}) {
  const r = rng(seed);
  const horizon = Math.round(h * 0.62);
  let body = "";
  // far hills
  body += `<path d="M0 ${horizon} Q${w * 0.25} ${horizon - 60 - r() * 30} ${w * 0.5} ${horizon - 20} T${w} ${horizon - 30} V${horizon + 4} H0Z" fill="${sepia ? "#a99a7e" : "#8fb07a"}"/>`;
  // houses
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const bw = 60 + r() * 60;
    const bh = 40 + r() * 40;
    const x = 30 + (i * (w - 120)) / n + r() * 20;
    const y = horizon - bh + 10 + r() * 30;
    const wall = sepia
      ? "#d8ccb2"
      : ["#f2e7c9", "#ead9b0", "#f6efe0"][Math.floor(r() * 3)];
    const roof = sepia
      ? "#6e5a44"
      : ["#b3261e", "#8a4a2b", "#a33b2d"][Math.floor(r() * 3)];
    body += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${wall}" stroke="#3f3013" stroke-width="2"/>`;
    body += `<path d="M${x - 6} ${y} L${x + bw / 2} ${y - 30} L${x + bw + 6} ${y}Z" fill="${roof}" stroke="#3f3013" stroke-width="2"/>`;
    body += `<rect x="${x + bw / 2 - 8}" y="${y + bh - 26}" width="16" height="26" fill="#6b4a2b"/>`;
  }
  // trees
  for (let i = 0; i < 5; i++) {
    const x = r() * w;
    const y = horizon + 20 + r() * (h - horizon - 60);
    body += `<rect x="${x - 3}" y="${y}" width="6" height="26" fill="#5b3c22"/><circle cx="${x}" cy="${y - 8}" r="${16 + r() * 10}" fill="${sepia ? "#8d8068" : "#4a7c2a"}"/>`;
  }
  // peppers
  for (let i = 0; i < 4; i++) {
    const x = 40 + r() * (w - 80);
    const y = horizon + 40 + r() * (h - horizon - 70);
    body += `<path d="M${x} ${y} c-8 0 -12 10 -9 20 c2 7 7 10 9 12 c2 -2 7 -5 9 -12 c3 -10 -1 -20 -9 -20z" fill="${sepia ? "#7a6a55" : "#b3261e"}"/>`;
  }
  if (bird)
    body += `<path d="M${w * 0.7} 60 q10 -12 20 0 q10 -12 20 0" fill="none" stroke="#333" stroke-width="2"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${caption}">
  <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#s)"/>
  <rect y="${horizon}" width="${w}" height="${h - horizon}" fill="${ground}"/>
  ${body}
  <text x="12" y="${h - 12}" font-family="Georgia, serif" font-size="18" fill="${sepia ? "#3d3224" : "#2b2b2b"}" opacity=".85">${caption}</text>
</svg>
`;
}

const files = {};
const ma = [
  "A főtér (illusztráció)",
  "A park (illusztráció)",
  "A művelődési ház (illusztráció)",
  "A piactér (illusztráció)",
  "A kis templom (illusztráció)",
  "A kastély (illusztráció)",
];
ma.forEach(
  (c, i) =>
    (files[`galeria/ma-${i + 1}.svg`] = scene({
      w: 640,
      h: 480,
      seed: 11 + i,
      sky: ["#9ec8e8", "#e9f2f8"],
      ground: "#9dbb7c",
      caption: c,
    })),
);
const mad = [
  "Madártávlat 1",
  "Madártávlat 2",
  "Madártávlat 3",
  "Madártávlat 4",
];
mad.forEach(
  (c, i) =>
    (files[`galeria/madartavlat-${i + 1}.svg`] = scene({
      w: 640,
      h: 427,
      seed: 41 + i,
      sky: ["#7fb2d9", "#dbe9f3"],
      ground: "#b7c98a",
      caption: `${c} (illusztráció)`,
      bird: true,
    })),
);
const regen = [
  "Régen: a gőzmalom",
  "Régen: az iskola",
  "Régen: a főtér",
  "Régen: a tehenészeti telep",
];
regen.forEach(
  (c, i) =>
    (files[`galeria/regen-${i + 1}.svg`] = scene({
      w: 458,
      h: 302,
      seed: 71 + i,
      sky: ["#d9cdb3", "#efe6d2"],
      ground: "#bfb293",
      caption: `${c} (illusztráció)`,
      sepia: true,
    })),
);

const sight = (w, h, inner, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}"><rect width="${w}" height="${h}" fill="#dcebf5"/><rect y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="#9dbb7c"/>${inner}</svg>\n`;
files["nevezetessegek/templom.svg"] = sight(
  146,
  196,
  `<rect x="48" y="70" width="50" height="110" fill="#f2e7c9" stroke="#3f3013" stroke-width="2"/><path d="M44 70 L73 14 L102 70Z" fill="#8a4a2b" stroke="#3f3013" stroke-width="2"/><path d="M73 14 v-10" stroke="#3f3013" stroke-width="2"/><path d="M68 4 c0 -4 10 -4 10 0 c0 6 -5 9 -5 9 c0 0 -5 -3 -5 -9z" fill="#b3261e"/><rect x="62" y="130" width="22" height="50" fill="#6b4a2b"/><circle cx="73" cy="95" r="9" fill="#ffd966" stroke="#3f3013"/>`,
  "Szent Paprika-templom",
);
files["nevezetessegek/kastely.svg"] = sight(
  196,
  146,
  `<rect x="22" y="50" width="152" height="68" fill="#f6efe0" stroke="#3f3013" stroke-width="2"/><path d="M16 50 L98 12 L180 50Z" fill="#a33b2d" stroke="#3f3013" stroke-width="2"/>${[40, 70, 110, 140].map((x) => `<rect x="${x}" y="68" width="14" height="22" fill="#6fa8c9" stroke="#3f3013"/>`).join("")}<rect x="88" y="86" width="20" height="32" fill="#6b4a2b"/><path d="M0 128 H196" stroke="#555" stroke-width="3"/><path d="M0 134 H196" stroke="#555" stroke-width="1" stroke-dasharray="6 6"/>`,
  "Vasútállomás-kastély",
);
files["nevezetessegek/emlekmu.svg"] = sight(
  146,
  196,
  `<rect x="40" y="150" width="66" height="26" fill="#9a9a9a" stroke="#333" stroke-width="2"/><path d="M73 40 c-18 0 -26 26 -20 50 c4 18 14 26 20 32 c6 -6 16 -14 20 -32 c6 -24 -2 -50 -20 -50z" fill="#b3261e" stroke="#600000" stroke-width="3"/><path d="M73 40 c-3 -10 2 -16 12 -18" fill="none" stroke="#3b6b1f" stroke-width="5" stroke-linecap="round"/><rect x="52" y="122" width="42" height="28" fill="#c9c9c9" stroke="#333"/>`,
  "A Névtelen Paprika Emlékműve",
);
files["nevezetessegek/kut.svg"] = sight(
  111,
  133,
  `<ellipse cx="55" cy="106" rx="46" ry="12" fill="#6fa8c9" stroke="#3f3013" stroke-width="2"/><rect x="50" y="52" width="10" height="54" fill="#b5651d" stroke="#3f3013"/><path d="M55 52 q-30 -20 -34 20 M55 52 q30 -20 34 20 M55 52 q-12 -30 -14 6 M55 52 q12 -30 14 6" fill="none" stroke="#2c9ad6" stroke-width="3" stroke-linecap="round"/>`,
  "A főtéri szökőkút",
);

for (const [name, svg] of Object.entries(files)) {
  const path = ROOT + name;
  await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, svg);
}
console.log("wrote", Object.keys(files).length, "illustrations");
