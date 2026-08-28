# Fade Media — Cases

The Cases tab on /fade-media renders from `cases.json`. To publish a new
celebrity case, add an object to the `cases` array (or send the info to
Claude and it will be formatted and pushed).

Fields per case:

  slug      unique id, lowercase ("drake")
  no        case file number as string ("003")
  name      display name ("Drake")
  title     case title ("The Drake Curse")
  status    "open" (full dossier) or "opening" (teaser card)
  verdict   "FADE" | "TAIL" | "PUSH"  — drives the stamp color
  tagline   one-liner under the name
  summary   short paragraph
  stats     [{ "label": "...", "value": "..." }]  (0-3 chips)
  timeline  [{ "date": "DEC 2022", "text": "...", "result": "W"|"L"|null }]
  sources   [{ "label": "thedrakecurse.com", "url": "https://..." }]
  image     optional — "assets/cases/drake.jpg" (add the file to
            public/assets/cases/)

Keep amounts "reported" unless verified. Newest case first is not
required; cards render in array order.
