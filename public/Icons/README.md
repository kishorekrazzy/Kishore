# Bento Card Icons

Drop the following PNG files in this folder. They will be loaded by the
"Chrome Extensions" and "AE Plugins" cards in the **Full Stack** section.

## Required files

| Filename | Used by | Suggested size |
| --- | --- | --- |
| `chrome-extensions.png` | Chrome Extensions card | 96×96 px or larger, transparent background |
| `after-effects.png`     | AE Plugins card        | 96×96 px or larger, transparent background |

## Notes

- PNG files are served directly from this folder at runtime
  (e.g. `/Icons/chrome-extensions.png`).
- The icon container is 48×48 px; the image is rendered at ~70% inside the
  container with `object-fit: contain`, so any reasonable aspect ratio works.
- Transparent backgrounds look best because the container has its own
  per-card tinted background that shows around the image.
- A subtle drop-shadow is applied via CSS — flat, monochrome icons work fine.
