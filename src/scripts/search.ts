interface Entry {
  title: string;
  url: string;
  kind: string;
  text: string;
}

const q = (new URLSearchParams(location.search).get("s") ?? "").trim();
const statusEl = document.getElementById("search-status")!;
const list = document.getElementById("search-results")!;
const input = document.getElementById("s") as HTMLInputElement | null;
if (input) input.value = q;

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

async function run() {
  if (!q) {
    statusEl.textContent = "Írjon be egy keresőszót.";
    return;
  }
  const entries: Entry[] = await (await fetch("/search-index.json")).json();
  const terms = fold(q).split(/\s+/).filter(Boolean);
  const hits = entries.filter((e) => {
    const hay = fold(`${e.title} ${e.text}`);
    return terms.every((t) => hay.includes(t));
  });
  statusEl.textContent = hits.length
    ? `${hits.length} találat a(z) „${q}” kifejezésre:`
    : `Nincs találat a(z) „${q}” kifejezésre.`;
  for (const h of hits) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = h.url;
    a.textContent = h.title;
    li.append(a, ` (${h.kind})`);
    list.append(li);
  }
}

run().catch(() => {
  statusEl.textContent = "A keresés nem érhető el.";
});
