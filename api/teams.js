// Resolves authoritative team marks from ESPN's public teams endpoint.
//
// The CDN path https://a.espncdn.com/i/teamlogos/{sport}/500/{abbr}.png is
// documented for nfl, nba and mlb, but college teams are keyed by numeric id
// rather than abbreviation, so that path cannot be derived for them. This
// endpoint returns the logo ESPN itself publishes per team, which works for
// every league, and is keyed by both id and abbreviation so either resolves.
//
// Logos change about never, so this is cached hard at the edge.
const LEAGUES = {
  nfl: ["football", "nfl"],
  cfb: ["football", "college-football"],
  "college-football": ["football", "college-football"],
  mlb: ["baseball", "mlb"],
  nba: ["basketball", "nba"],
  wnba: ["basketball", "wnba"],
  nhl: ["hockey", "nhl"],
};

function pickLogo(team) {
  const logos = team?.logos;
  if (Array.isArray(logos) && logos.length) {
    // prefer the default mark over the dark/scoreboard variants
    const plain = logos.find((l) => !(l.rel || []).includes("dark"));
    return (plain || logos[0]).href || "";
  }
  return team?.logo || "";
}

export default async function handler(req, res) {
  const key = String(req.query?.league || "nfl").toLowerCase();
  const entry = LEAGUES[key];
  if (!entry) {
    res.status(400).json({ error: "unknown league", supported: Object.keys(LEAGUES) });
    return;
  }
  const [sport, league] = entry;
  try {
    const r = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/teams?limit=1000`
    );
    if (!r.ok) throw new Error(String(r.status));
    const data = await r.json();

    // teams arrive nested: sports[0].leagues[0].teams[].team
    const rows = data?.sports?.[0]?.leagues?.[0]?.teams || [];
    const teams = rows
      .map(({ team }) => ({
        id: team?.id || "",
        abbr: team?.abbreviation || "",
        name: team?.shortDisplayName || team?.displayName || "",
        full: team?.displayName || "",
        logo: pickLogo(team),
      }))
      .filter((t) => t.logo && (t.abbr || t.id));

    // a flat lookup so the client resolves by abbreviation or id without scanning
    const byKey = {};
    for (const t of teams) {
      if (t.abbr) byKey[t.abbr.toUpperCase()] = t.logo;
      if (t.id) byKey[t.id] = t.logo;
    }

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).json({ league: key, count: teams.length, logos: byKey, teams });
  } catch (e) {
    res.status(502).json({ error: "teams fetch failed", league: key });
  }
}
