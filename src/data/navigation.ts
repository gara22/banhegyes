export interface NavItem {
  label: string;
  /** Absolute site path with trailing slash. */
  path: string;
  children?: NavItem[];
}

const i = (label: string, path: string, children?: NavItem[]): NavItem => ({
  label,
  path,
  children,
});

// Order and labels follow the reference site's main menu.
export const navigation: NavItem[] = [
  i("Hivatal", "/hivatal/", [
    i("Nyilvántartások", "/hivatal/nyilvantartasok/", [
      i("Kereskedelem", "/hivatal/nyilvantartasok/kereskedelem/"),
    ]),
  ]),
  i("KarrierM", "/karrierm/"),
  i(
    "Képviselő-testület választásának eredményei",
    "/kepviselo-testulet-valasztasanak-eredmenyei/",
  ),
  i("Közérdekű adatok", "/kozerdeku-adatok/", [
    i("Tevékenység működés", "/kozerdeku-adatok/tevekenyseg-mukodes/"),
    i("Gazdálkodási adatok", "/kozerdeku-adatok/gazdalkodasi-adatok/"),
    i("Pályázatok", "/kozerdeku-adatok/palyazatok/"),
    i("Üvegzseb", "/kozerdeku-adatok/uvegzseb/"),
    i("Közbeszerzések", "/kozerdeku-adatok/kozbeszerzesek/"),
    i("Szerződések", "/kozerdeku-adatok/szerzodesek/"),
    i("Adatvédelem", "/kozerdeku-adatok/adatvedelem/"),
  ]),
  i("Magyar Falu Program", "/magyar-falu-program/"),
  i(
    "Nagybánhegyesi Szlovák Nemzetiségi Önkormányzat",
    "/szlovak-nemzetisegi-onkormanyzat/",
  ),
  i("Polgármester választás eredményei", "/polgarmester-valasztas-eredmenyei/"),
  i(
    "Szlovák nemzetiségi önkormányzat választás eredményei",
    "/szlovak-nemzetisegi-onkormanyzat-valasztas-eredmenyei/",
  ),
  i("TAK", "/tak/"),
  i("TAK és a TKR egyeztetése", "/tak-es-a-tkr-egyeztetese/"),
  i("Választási információk", "/valasztasi-informaciok/", [
    i(
      "2024. évi általános választások",
      "/valasztasi-informaciok/2024-evi-altalanos-valasztasok/",
      [
        i(
          "Határozatok",
          "/valasztasi-informaciok/2024-evi-altalanos-valasztasok/hatarozatok/",
        ),
        i(
          "Jelölteknek",
          "/valasztasi-informaciok/2024-evi-altalanos-valasztasok/jeloltteknek/",
        ),
        i(
          "Választópolgároknak",
          "/valasztasi-informaciok/2024-evi-altalanos-valasztasok/valasztopolgaroknak/",
        ),
      ],
    ),
    i(
      "2026. évi országgyűlési választások",
      "/valasztasi-informaciok/2026-evi-orszaggyulesi-valasztasok/",
    ),
    i("Korábbi választások", "/valasztasi-informaciok/korabbi-valasztasok/"),
    i("Választási szervek", "/valasztasi-informaciok/valasztasi-szervek/", [
      i(
        "A választási bizottság",
        "/valasztasi-informaciok/valasztasi-szervek/a-valasztasi-bizottsag/",
      ),
      i(
        "A választási ioda",
        "/valasztasi-informaciok/valasztasi-szervek/a-valasztasi-ioda/",
      ),
    ]),
    // The original links to an external election-office site; kept internal here.
    i(
      "Választási ügyintézés",
      "/valasztasi-informaciok/valasztasi-ugyintezes/",
    ),
  ]),
  i("Versenyképes Járások Program", "/versenykepes-jarasok-program/"),
  i("Főoldal", "/"),
  i("Hírek", "/hirek/"),
  i("Falunkról", "/falunkrol/", [
    i("Képgaléria", "/falunkrol/kepgaleria/"),
    i("Nevezetességek", "/falunkrol/nevezetessegek/"),
    i("Paprikafesztivál", "/falunkrol/paprikafesztival/"),
    i("Testvértelepülések", "/falunkrol/testvertelepulesek/"),
  ]),
  i("Virtuális séta", "/virtualis-seta/"),
  i("Választások", "/valasztasok/", [
    i(
      "HVB határozatok 2019. október 13-i választással összefüggésben",
      "/valasztasok/hvb-hatarozatok-2019/",
    ),
    i("Választások 2019", "/valasztasok/valasztasok-2019/"),
  ]),
  i("Önkormányzat", "/onkormanyzat/", [
    i("Dokumentumok", "/onkormanyzat/dokumentumok/"),
    i("E-ügyintézés", "/onkormanyzat/e-ugyintezes/"),
    i("Képviselő Testület", "/onkormanyzat/kepviselo-testulet/", [
      i(
        "Vagyonnyilatkozatok",
        "/onkormanyzat/kepviselo-testulet/vagyonnyilatkozatok/",
      ),
    ]),
    i("Rendeletek", "/onkormanyzat/rendeletek/"),
    i("Testületi ülések", "/onkormanyzat/testuleti-ulesek/"),
  ]),
  i("Civil szervezetek", "/civil-szervezetek/"),
  i("Intézmények", "/intezmenyek/", [
    i("Iskola és Óvoda", "/intezmenyek/iskola-es-ovoda/"),
    i("Konyha", "/intezmenyek/konyha/"),
    i("Művelődési Ház", "/intezmenyek/muvelodesi-haz/"),
    i("Termálfürdő és Camping", "/intezmenyek/termalfurdo-es-camping/"),
  ]),
  i("Közérdekű Info", "/kozerdeku-info/"),
  i("Pályázatok", "/palyazatok/", [
    i("EFOP-1.5.3-16-2017-00062", "/palyazatok/efop-1-5-3-16-2017-00062/"),
    i("EFOP-3.9.2-16-2017-00027", "/palyazatok/efop-3-9-2-16-2017-00027/"),
  ]),
  i("TOP Pályázatok", "/top-palyazatok/", [
    i(
      "TOP PLUSZ 2.1.1-21-BS1-2022-00027",
      "/top-palyazatok/top-plusz-2-1-1-21-bs1-2022-00027/",
    ),
    i(
      "TOP_PLUSZ-2.1.1-21-BS1-2022-00026 „Művelődési ház energetikai korszerűsítése Nagybánhegyesen”",
      "/top-palyazatok/top-plusz-2-1-1-21-bs1-2022-00026/",
    ),
    i(
      "TOP-1.4.1-15-BS1-2016-00043",
      "/top-palyazatok/top-1-4-1-15-bs1-2016-00043/",
    ),
    i(
      "TOP-1.1.3-15-BS1-2016-00028",
      "/top-palyazatok/top-1-1-3-15-bs1-2016-00028/",
    ),
    i(
      "TOP-4.1.1-15-BS1-2016-00023",
      "/top-palyazatok/top-4-1-1-15-bs1-2016-00023/",
    ),
  ]),
  i("Közbeszerzések", "/kozbeszerzesek/", [
    i(
      "A Savio Szent Domonkos Katolikus Általános Iskola és Óvoda nagybánhegyesi épületének felújítása",
      "/kozbeszerzesek/iskola-felujitasa/",
    ),
    i(
      "Nagybánhegyes Orvosi Rendelőjének Infrastrukturális Fejlesztése",
      "/kozbeszerzesek/orvosi-rendelo-fejlesztese/",
    ),
  ]),
  i("Kérdőívek", "/kerdoivek/"),
];

/** Paths served by dedicated routes instead of the content-driven catch-all. */
/** "/a/b/" -> "a/b" (content collection id). */
export const pathId = (path: string) => path.replace(/^\/|\/$/g, "");

export const dedicatedPaths = new Set([
  "/",
  "/hirek/",
  "/falunkrol/kepgaleria/",
]);

export interface FlatNavItem extends NavItem {
  depth: number;
  parent?: NavItem;
}

export function flattenNav(
  items: NavItem[] = navigation,
  depth = 0,
  parent?: NavItem,
): FlatNavItem[] {
  return items.flatMap((item) => [
    { ...item, depth, parent },
    ...flattenNav(item.children ?? [], depth + 1, item),
  ]);
}

export function findNav(path: string): FlatNavItem | undefined {
  return flattenNav().find((n) => n.path === path);
}

/** Ancestors from the root down to (excluding) the item. */
export function breadcrumbs(path: string): NavItem[] {
  const chain: NavItem[] = [];
  const walk = (items: NavItem[], trail: NavItem[]): boolean => {
    for (const item of items) {
      if (item.path === path) {
        chain.push(...trail);
        return true;
      }
      if (item.children && walk(item.children, [...trail, item])) return true;
    }
    return false;
  };
  walk(navigation, []);
  return chain;
}
