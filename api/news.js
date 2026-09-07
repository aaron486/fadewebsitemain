// Aggregates sports + betting news for the Fade Media front page.
// ESPN public JSON feeds carry the league wires (with photos); betting-first
// outlets come in over RSS. Everything is credited and linked to the source.
const ESPN_FEEDS = [
  ["football/nfl", "NFL"],
  ["football/college-football", "CFB"],
  ["baseball/mlb", "MLB"],
  ["basketball/nba", "NBA"],
  ["basketball/wnba", "WNBA"],
  ["hockey/nhl", "NHL"],
];

const RSS_FEEDS = [
  ["https://www.vsin.com/feed/", "VSiN"],
  ["https://www.ingame.com/feed/", "InGame"],
  ["https://www.legalsportsreport.com/feed/", "Legal Sports Report"],
  ["https://sportshandle.com/feed/", "Sports Handle"],
];

function parseRss(xml, source) {
  const out = [];
  const blocks = xml.split("<item>").slice(1);
  for (const b of blocks.slice(0, 8)) {
    const chunk = b.split("</item>")[0];
    const pick = (tag) => {
      const m = chunk.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
      return m ? m[1].trim() : "";
    };
    const clean = (s) => s
      .replace(/<!\[CDATA\[|\]\]>/g, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n))
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ").trim();
    const title = clean(pick("title"));
    const link = clean(pick("link"));
    let dek = clean(pick("description"))
      .replace(/The post .*$/i, "")
      .trim()
      .slice(0, 220);
    const pub = pick("pubDate");
    let img = "";
    const m = chunk.match(/<media:content[^>]*url=["']([^"']+)["']/i)
      || chunk.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i)
      || chunk.match(/<img[^>]*src=["']([^"']+)["']/i);
    if (m) img = m[1];
    if (title && link) {
      out.push({
        league: "BETTING", src: source, title, dek,
        img: img.slice(0, 500), url: link,
        published: pub ? new Date(pub).toISOString() : "",
        byline: source,
      });
    }
  }
  return out;
}

export default async function handler(req, res) {
  try {
    const espn = ESPN_FEEDS.map(async ([path, league]) => {
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
          league, src: "ESPN",
          title: a.headline || "",
          dek: a.description || "",
          img: img ? img.url : "",
          url: a.links?.web?.href || "",
          published: a.published || a.lastModified || "",
          byline: a.byline || "",
        };
      });
    });
    const rss = RSS_FEEDS.map(async ([url, source]) => {
      const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (FadeMedia aggregator)" } });
      if (!r.ok) throw new Error(String(r.status));
      return parseRss(await r.text(), source);
    });
    const settled = await Promise.allSettled([...espn, ...rss]);
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
      .slice(0, 60);
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
