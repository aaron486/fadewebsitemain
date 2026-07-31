# Solution section screen recordings

Videos shown under each bullet in the "The Solution" section on /media.

Slots (H.264 MP4, portrait):
  slot 1 uses assets/betcard-demo.mp4 (shareable bet card) — See their friends' picks & share wins
  solution-2.mp4  Analyze their bet history
  solution-3.mp4  Use AI to bet better
  solution-4.mp4  Access stats and research before placing a pick

A slot whose file is missing shows a dashed "demo coming" placeholder.
iPhone screen recordings are HEVC (.mov) — transcode before adding:
  ffmpeg -i in.mov -vf "scale=720:-2" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -an solution-N.mp4
