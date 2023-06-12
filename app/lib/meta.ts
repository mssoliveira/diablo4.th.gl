import { Metadata } from "next";
import { loadDictionary } from "./i18n";
import nodes from "./nodes";
import { getTerritoryByPoint } from "./territories";

export function generateMetadata({
  params: { lang, name },
}: {
  params: { lang: string; name: string };
}): Metadata {
  const dict = loadDictionary(lang);
  const title = name ? decodeURIComponent(name) : "Sanctuary";

  let node = null;
  let type = null;
  for (const [_type, items] of Object.entries(nodes)) {
    type = _type as keyof typeof nodes;
    for (const item of items) {
      if (item.name === title) {
        node = item;
        break;
      }
    }
    if (node) {
      break;
    }
  }

  let description = dict.meta.description;
  if (node) {
    const territory = getTerritoryByPoint([node.x, node.y]);
    description = node.name;
    if (type) {
      description += ` (${dict.nodes[type]})`;
    }
    if (territory) {
      description += ` in ${dict.territories[territory.id]}`;
    }
    if ("description" in node) {
      description += `. ${node.description.replace(/<\/?[^>]+(>|$)/g, "")}`;
    }
  }

  return {
    title: `${title} | ${dict.meta.subtitle} | diablo4.th.gl`,
    description: description,
    creator: "Leon Machens",
    themeColor: "black",
    alternates: {
      canonical: "/",
      languages: {
        en: "/",
        de: "/de",
      },
    },
    openGraph: {
      title: `Sanctuary | ${dict.meta.subtitle} | diablo4.th.gl`,
      description: description,
      type: "website",
      url: "https://diablo4.th.gl",
    },
  };
}
