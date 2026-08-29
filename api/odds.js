// Proxies The Odds API so the key stays server-side and responses are
// edge-cached — the whole site shares a few upstream calls per hour.
// One request per league: the shared "upcoming" endpoint only returns the
// next 8 events across all sports, which drops most of the day's slate.
const SPORTS = [
  ["americanfootball_ncaaf", "CFB"],
  ["americanfootball_nfl", "NFL"],
  ["baseball_mlb", "MLB"],
  ["basketball_nba", "NBA"],
  ["basketball_wnba", "WNBA"],
  ["icehockey_nhl", "NHL"],
  ["soccer_usa_mls", "MLS"],
];

export default async function handler(req, res) {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    res.status(500).json({ error: "ODDS_API_KEY is not configured" });
    return;
  }
  try {
    const now = Date.now();
    const settled = await Promise.allSettled(
      SPORTS.map(async ([sport, label]) => {
        const r = await fetch(
          `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=us&markets=h2h,spreads,totals&oddsFormat=american&apiKey=${key}`
        );
        if (!r.ok) throw new Error(String(r.status));
        const data = await r.json();
        return (Array.isArray(data) ? data : []).map((ev) => {
          // take the first book that carries each market so a game isn't
          // lineless just because bookmaker #1 skipped it
          const prices = {};
          const spreads = {};
          let total = null;
          (ev.bookmakers || []).some((bk) => {
            (bk.markets || []).forEach((m) => {
              if (m.key === "h2h" && !Object.keys(prices).length) {
                (m.outcomes || []).forEach((o) => { prices[o.name] = o.price; });
              } else if (m.key === "spreads" && !Object.keys(spreads).length) {
                (m.outcomes || []).forEach((o) => { spreads[o.name] = o.point; });
              } else if (m.key === "totals" && total == null) {
                const over = (m.outcomes || []).find((o) => o.name === "Over");
                if (over) total = over.point;
              }
            });
            return Object.keys(prices).length > 0 && Object.keys(spreads).length > 0 && total != null;
          });
          return {
            sport: label,
            away: ev.away_team,
            home: ev.home_team,
            start: ev.commence_time,
            live: new Date(ev.commence_time).getTime() <= now,
            prices,
            spreads,
            total,
          };
        });
      })
    );
    const events = settled
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .filter((ev) => Object.keys(ev.prices).length > 0 || Object.keys(ev.spreads).length > 0)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
      .slice(0, 400);
    if (!events.length && settled.every((r) => r.status === "rejected")) {
      res.status(502).json({ error: "odds upstream failed" });
      return;
    }
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.status(200).json({ events });
  } catch (e) {
    res.status(502).json({ error: "odds fetch failed" });
  }
}
