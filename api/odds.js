// Proxies The Odds API so the key stays server-side and responses are
// edge-cached — the whole site shares a few upstream calls per hour.
export default async function handler(req, res) {
  const key = process.env.ODDS_API_KEY;
  if (!key) {
    res.status(500).json({ error: "ODDS_API_KEY is not configured" });
    return;
  }
  try {
    const upstream = await fetch(
      "https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=us&markets=h2h&oddsFormat=american&apiKey=" + key
    );
    if (!upstream.ok) {
      res.status(502).json({ error: "odds upstream " + upstream.status });
      return;
    }
    const data = await upstream.json();
    const now = Date.now();
    const events = (Array.isArray(data) ? data : [])
      .slice(0, 30)
      .map((ev) => {
        const market = ev.bookmakers?.[0]?.markets?.find((m) => m.key === "h2h");
        const prices = {};
        market?.outcomes?.forEach((o) => { prices[o.name] = o.price; });
        return {
          sport: ev.sport_title,
          away: ev.away_team,
          home: ev.home_team,
          start: ev.commence_time,
          live: new Date(ev.commence_time).getTime() <= now,
          prices,
        };
      })
      .filter((ev) => Object.keys(ev.prices).length > 0);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
    res.status(200).json({ events });
  } catch (e) {
    res.status(502).json({ error: "odds fetch failed" });
  }
}
