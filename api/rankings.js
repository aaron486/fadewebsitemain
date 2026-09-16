// AP Top 25 / Coaches Poll, from ESPN's public rankings feed.
// Shapes vary a little between leagues and seasons, so every field is read
// defensively — a missing poll should thin the rail, never break the page.
const LEAGUES = {
  cfb: ["football", "college-football"],
  "college-football": ["football", "college-football"],
  cbb: ["basketball", "mens-college-basketball"],
};

function logoOf(team) {
  if (!team) return "";
  if (typeof team.logo === "string" && team.logo) return team.logo;
  const l = team.logos;
  if (Array.isArray(l) && l.length) {
    const plain = l.find((x) => !(x.rel || []).includes("dark"));
    return (plain || l[0]).href || "";
  }
  return "";
}

export default async function handler(req, res) {
  const key = String(req.query?.league || "cfb").toLowerCase();
  const entry = LEAGUES[key];
  if (!entry) {
    res.status(400).json({ error: "unknown league", supported: Object.keys(LEAGUES) });
    return;
  }
  const [sport, league] = entry;
  try {
    const r = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/rankings`
    );
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();

    const polls = (data?.rankings || []).map((poll) => ({
      name: poll?.shortName || poll?.name || "Poll",
      full: poll?.name || "",
      headline: poll?.headline || "",
      teams: (poll?.ranks || []).map((rk) => {
        const t = rk?.team || {};
        return {
          rank: rk?.current ?? null,
          previous: rk?.previous ?? null,
          // positive means climbing; ESPN reports the direction in `trend`
          trend: typeof rk?.trend === "string" ? rk.trend.trim() : "",
          points: rk?.points ?? null,
          id: t.id || "",
          abbr: t.abbreviation || t.shortDisplayName || "",
          name: t.nickname || t.shortDisplayName || t.displayName || t.name || "",
          full: t.displayName || t.location || "",
          logo: logoOf(t),
          record: rk?.recordSummary || "",
        };
      }).filter((t) => t.rank != null && t.name),
    })).filter((p) => p.teams.length);

    if (!polls.length) throw new Error("no polls");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json({ league: key, updated: data?.latestWeek?.displayName || "", polls });
  } catch (e) {
    res.status(502).json({ error: "rankings fetch failed", league: key });
  }
}
