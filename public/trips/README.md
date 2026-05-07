Put trip photos and videos in this folder.

The trip page automatically looks for media in a folder that matches the trip
slug from `data/trips.ts`.

Examples:

- `public/trips/london/01.jpg`
- `public/trips/london/02.mp4`
- `public/trips/london/03.jpg`
- `public/trips/cabo/beach.webm`

Supported image files:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.avif`
- `.gif`

Supported video files:

- `.mp4`
- `.webm`
- `.ogg`
- `.mov`

Videos autoplay muted, loop, and play inline on mobile.

Use filenames like `01.jpg`, `02.mp4`, `03-dinner.jpg` if you want to control
the order. The page sorts files by filename.
