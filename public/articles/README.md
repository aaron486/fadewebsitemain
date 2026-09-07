# Fade Media — custom articles

The newsroom on /fade-media renders your own articles from `articles.json`,
mixed with the wire headlines. To publish, add an object to the `articles`
array (or send the draft to Claude and it will be formatted and pushed).

Fields per article:

  slug       unique id, lowercase-with-dashes ("drake-week-1-card")
  league     category chip shown on the card: "DESK", "NFL", "CFB", "MLB",
             "NBA", "WNBA", "NHL" — league values also make the article
             appear under that league tab
  title      the headline
  dek        one-two sentence summary shown under the headline
  author     byline ("Fade Desk", "@handle", a name)
  published  ISO timestamp ("2026-09-07T14:00:00Z") — controls sort order
  image      repo path ("assets/foo.jpg" — put the file in public/assets/)
             or a full https URL you have rights to
  featured   true to force the article into the lead (hero) slot
  body       array of paragraph strings — this is the article text shown
             on its own page at fade.bet/article?s=<slug>

Notes:
- Custom articles always outrank wire items for the lead slot when
  `featured` is true; otherwise they sort by `published` with everything else.
- Only use images you own or have licensed.
