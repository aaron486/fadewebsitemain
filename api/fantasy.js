// Fantasy points leaders.
//
// The source is an HTML report rather than a JSON feed, so this reads the
// table semantically: it takes the largest table on the page and maps columns
// by their header text (Rank / Player / Team / Pos / FPTS / G / AVG) instead
// of by class names or column order. Markup changes that would break a
// selector-based scraper leave this working; only a header rename breaks it,
// and that surfaces as a 502 the rail treats as "no fantasy tab" rather than
// as a broken section.
const SOURCE = process.env.FANTASY_SOURCE_URL || "https://www.fantasypros.com/nfl/reports/leaders/";

// header text -> the field we want it in
const COLUMNS = [
  ["rank", /^(rank|rk|#)$/i],
  ["name", /^(player|name)$/i],
  ["team", /^(team|tm)$/i],
  ["position", /^(pos|position)$/i],
  ["points", /^(fpts|points|pts|fantasy points|total)$/i],
  ["games", /^(g|games|gp)$/i],
  ["avg", /^(avg|fpts\/g|avg\.?|average|ppg)$/i],
];

const strip = (html) =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (m, n) => String.fromCharCode(n))
    .replace(/\s+/g, " ")
    .trim();

function cellsOf(rowHtml) {
  const out = [];
  const re = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
  let m;
  while ((m = re.exec(rowHtml))) out.push(strip(m[1]));
  return out;
}

function rowsOf(tableHtml) {
  const out = [];
  const re = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = re.exec(tableHtml))) out.push(cellsOf(m[0]));
  return out.filter((r) => r.length);
}

function biggestTable(html) {
  const re = /<table[\s\S]*?<\/table>/gi;
  let best = "";
  let m;
  while ((m = re.exec(html))) if (m[0].length > best.length) best = m[0];
  return best;
}

// "Josh Allen (BUF)" is one cell on some reports; split the team back out
function splitTeam(name) {
  const m = String(name).match(/^(.*?)\s*\(([A-Z]{2,4})\)\s*$/);
  return m ? { name: m[1].trim(), team: m[2] } : { name: String(name).trim(), team: "" };
}

export function parseLeaders(html, limit) {
  const table = biggestTable(html);
  if (!table) return [];
  const rows = rowsOf(table);
  if (rows.length < 2) return [];

  // the first row whose cells match known headers is the header row
  let headerAt = -1;
  let map = {};
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const candidate = {};
    rows[i].forEach((h, idx) => {
      for (const [field, re] of COLUMNS) {
        if (re.test(h) && candidate[field] == null) candidate[field] = idx;
      }
    });
    if (candidate.name != null && candidate.points != null) {
      headerAt = i;
      map = candidate;
      break;
    }
  }
  if (headerAt === -1) return [];

  const out = [];
  for (let i = headerAt + 1; i < rows.length && out.length < limit; i++) {
    const r = rows[i];
    const rawName = r[map.name] || "";
    if (!rawName) continue;
    const split = splitTeam(rawName);
    const points = r[map.points] || "";
    if (!points || !/[\d.]/.test(points)) continue;
    out.push({
      rank: map.rank != null && r[map.rank] ? r[map.rank].replace(/\D/g, "") : String(out.length + 1),
      name: split.name,
      team: (map.team != null && r[map.team]) || split.team || "",
      position: (map.position != null && r[map.position]) || "",
      points,
      games: (map.games != null && r[map.games]) || "",
      avg: (map.avg != null && r[map.avg]) || "",
    });
  }
  return out;
}

export default async function handler(req, res) {
  const limit = Math.min(Number(req.query?.limit) || 25, 50);
  try {
    const r = await fetch(SOURCE, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; FadeMedia/1.0; +https://fade.bet)" },
    });
    if (!r.ok) throw new Error(String(r.status));
    const leaders = parseLeaders(await r.text(), limit);
    if (!leaders.length) throw new Error("no rows parsed");
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=7200");
    res.status(200).json({ source: "FantasyPros", sourceUrl: SOURCE, count: leaders.length, leaders });
  } catch (e) {
    res.status(502).json({ error: "fantasy leaders fetch failed", sourceUrl: SOURCE });
  }
}
