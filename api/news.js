// Aggregates ESPN's public news feeds (headline, dek, photo, link) across
// the major leagues for the Fade Media front page — the same wire the
// in-app media desk reads. Edge-cached so the site shares upstream calls.
const FEEDS = [
  ["football/nfl", "NFL"],
  ["football/college-football", "CFB"],
  ["baseball/mlb", "MLB"],
  ["basketball/nba", "NBA"],
  ["basketball/wnba", "WNBA"],
  ["hockey/nhl", "NHL"],
];

export default async function handler(req, res) {
  try {
    const settled = await Promise.allSettled(
      FEEDS.map(async ([path, league]) => {
        const r = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${path}/news?limit=12`
        );
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        return (data.articles || []).map((a) => {
          const img =
            (a.images || []).find((i) => i.url && (i.width || 0) >= 400) ||
            (a.images || [])[0];
          return {
            league,
            title: a.headline || "",
            dek: a.description || "",
            img: img ? img.url : "",
            url: a.links?.web?.href || "",
            published: a.published || a.lastModified || "",
            byline: a.byline || "",
          };
        });
      })
    );
    const seen = new Set();
    const articles = settled
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((a) => {
        if (!a.title || seen.has(a.title)) return false;
        seen.add(a.title);
        return true;
      })
      .sort((a, b) => new Date(b.published) - new Date(a.published))
      .slice(0, 48);
    if (!articles.length) {
      res.status(502).json({ error: "news upstream failed" });
      return;
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.status(200).json({ articles });
  } catch (e) {
    res.status(502).json({ error: "news fetch failed" });
  }
}
