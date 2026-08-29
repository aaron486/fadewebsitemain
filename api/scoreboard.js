// Aggregates ESPN's public scoreboard feeds (logos, records, live scores)
// across the major leagues, slimmed and edge-cached for the Games tab.
// CFB needs groups=80 — ESPN's default scoreboard only carries Top-25 games
const LEAGUES = [
  ["football", "nfl", "NFL", ""],
  ["football", "college-football", "CFB", "?groups=80&limit=300"],
  ["baseball", "mlb", "MLB", ""],
  ["basketball", "nba", "NBA", ""],
  ["basketball", "wnba", "WNBA", ""],
  ["hockey", "nhl", "NHL", ""],
  ["soccer", "usa.1", "MLS", ""],
];

export default async function handler(req, res) {
  try {
    const results = await Promise.allSettled(
      LEAGUES.map(async ([sport, league, label, extra]) => {
        const r = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard${extra}`
        );
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        const games = (data.events || []).slice(0, 300).map((ev) => {
          const comp = ev.competitions?.[0] || {};
          const odds = comp.odds?.[0];
          const teams = (comp.competitors || [])
            .sort((a) => (a.homeAway === "away" ? -1 : 1))
            .map((c) => ({
              name: c.team?.shortDisplayName || c.team?.displayName || "",
              full: c.team?.displayName || "",
              abbr: c.team?.abbreviation || "",
              logo: c.team?.logo || "",
              score: c.score || "",
              record: c.records?.[0]?.summary || "",
              home: c.homeAway === "home",
              winner: !!c.winner,
            }));
          return {
            id: ev.id,
            date: ev.date,
            state: ev.status?.type?.state || "pre", // pre | in | post
            detail: ev.status?.type?.shortDetail || "",
            odds: odds?.details || "",
            ou: odds?.overUnder || null,
            tv: comp.broadcasts?.[0]?.names?.[0] || "",
            teams,
          };
        });
        return { key: league, label, games };
      })
    );
    const leagues = results
      .filter((r) => r.status === "fulfilled" && r.value.games.length > 0)
      .map((r) => r.value);
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ leagues });
  } catch (e) {
    res.status(502).json({ error: "scoreboard fetch failed" });
  }
}
