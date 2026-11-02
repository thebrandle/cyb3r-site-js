SEO & Google Ads clip (homepage Services panel 3 and the /services SEO panel).

clip.html draws every frame as a pure function of time (render(t), 8.4 s loop, starts on the full results + metrics frame so the poster is that frame).
render.js screenshots it at 60 fps / 2x and pipes into ffmpeg, which averages frame pairs into 30 fps (light motion blur) -> master.mp4 (1600x1120).

Renditions (cyb3r-svc-media/svc/seoads_w_<w>.mp4, 10:7):
  for w in 1440 800 720 640 480; do ffmpeg -i master.mp4 -vf "scale=$w:$((w*7/10)):flags=lanczos" -c:v libx264 -profile:v high -crf 22 -preset veryslow -pix_fmt yuv420p -g 60 -movflags +faststart -an seoads_w_$w.mp4; done
  (crf 23 for 1440). Poster = the 800 rendition at 0.2 s (data-t 0.2), webp q82.
