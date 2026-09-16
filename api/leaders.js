// Statistical leaders. ESPN nests these two different ways depending on the
// endpoint version, so both are accepted and normalised to one shape.
const LEAGUES = {
  nfl: ["football", "nfl"],
  cfb: ["football", "college-football"],
  "college-football": ["football", "college-football"],
  mlb: ["baseball", "mlb"],
  nba: ["basketball", "nba"],
  nhl: ["hockey", "nhl"],
};

function headshotOf(a) {
  const h = a?.headshot;
  if (typeof h === "string") return h;
  return h?.href || "";
}

export default async function handler(req, res) {
  const key = String(req.query?.league || "nfl").toLowerCase();
  const limit = Math.min(Number(req.query?.limit) || 5, 25);
  const entry = LEAGUES[key];
  if (!entry) {
    res.status(400).json({ error: "unknown league", supported: Object.keys(LEAGUES) });
    return;
  }
  const [sport, league] = entry;
  try {
    const r = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/leaders`
    );
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();

    // seen as data.categories and as data.leaders.categories
    const raw = data?.categories || data?.leaders?.categories || [];
    const categories = raw.map((c) => ({
      key: c?.name || "",
      name: c?.displayName || c?.shortDisplayName || c?.name || "",
      abbr: c?.abbreviation || "",
      leaders: (c?.leaders || []).slice(0, limit).map((l, i) => {
        const a = l?.athlete || {};
        const t = l?.team || a.team || {};
        return {
          rank: i + 1,
          id: a.id || "",
          name: a.displayName || a.fullName || a.shortName || "",
          short: a.shortName || a.displayName || "",
          position: a.position?.abbreviation || "",
          team: t.abbreviation || t.shortDisplayName || "",
          teamId: t.id || "",
          headshot: headshotOf(a),
          value: l?.displayValue || (l?.value != null ? String(l.value) : ""),
        };
      }).filter((l) => l.name && l.value),
    })).filter((c) => c.leaders.length);

    if (!categories.length) throw new Error("no categories");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
    res.status(200).json({ league: key, categories });
  } catch (e) {
    res.status(502).json({ error: "leaders fetch failed", league: key });
  }
}
