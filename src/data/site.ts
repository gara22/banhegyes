export const site = {
  title: "Nagybánhegyes Község",
  titleSeparator: " » ",
  description: "Nagybánhegyes Község honlapja – nem hivatalos paródia.",
  // Placeholder wording until the final disclaimer is decided.
  disclaimer: {
    strong: "FIGYELEM! Nem hivatalos paródia.",
    text: "Ez az oldal szatirikus, kitalált tartalmat közöl, és semmilyen valódi önkormányzattal vagy hivatallal nincs kapcsolatban.",
  },
  footer: {
    left: "Nagybánhegyes Község (paródia) is proudly powered by",
    vendor: "a képzelet",
  },
  postsPerPage: 10,
  recentPostsCount: 10,
  // POST target for the home-page contact form (proxied to the contact-api service); empty = demo mode, nothing is sent.
  contactEndpoint: "/api/contact",
};

export function pageTitle(title?: string): string {
  return title ? `${site.title}${site.titleSeparator}${title}` : site.title;
}
