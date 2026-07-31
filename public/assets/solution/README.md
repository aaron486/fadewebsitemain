# Solution section demo videos

Videos revealed by the expandable points in "The Solution" on /media.

  bullet 1  See your friends picks        -> solution-1.mp4 (live)
  bullet 2  Share wins                    -> solution-2.mp4
  bullet 3  Analyze their bet history     -> solution-3.mp4
  bullet 4  Use AI to bet better          -> solution-4.mp4
  bullet 5  Stats & research before pick  -> solution-5.mp4

Missing files show a dashed "Demo coming" placeholder when expanded.
iPhone recordings are HEVC (.mov) — transcode before adding:
  ffmpeg -i in.mov -vf "scale=720:-2" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -an solution-N.mp4
