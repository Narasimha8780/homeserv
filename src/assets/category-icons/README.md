# Service category artwork

Each PNG is a separate service icon. The artwork follows the supplied reference:
colorful square tiles with centered illustrations and no embedded labels. The
shared `CategoryIcon` component applies rounded corners; category names remain
accessible text in the UI.

| Service | Asset |
| --- | --- |
| Driver | `driver.png` |
| Plumber | `plumber.png` |
| Electrician | `electrician.png` |
| Insta Help | `insta-help.png` |
| Saree Draping | `saree-draping.png` |
| Mehendi Service | `mehendi-service.png` |
| Pest Control | `pest-control.png` |
| Carpenter | `carpenter.png` |
| Women Spa | `spa.png` |
| Interior | `interior.png` |
| Painters | `painter.png` |
| Home Cleaning | `home-cleaning.png` |
| Bridal Makeup | `bridal-makeup.png` |
| Photography | `photography.png` |
| Events | `events.png` |

`src/utils/categoryIcons.ts` bundles assets by filename and matches common title
variants for admin-created categories. Existing All, Barber, AC Repair, and
Appliance Repair artwork is retained. Unknown categories use the existing Lucide
fallback.

Categories are supplied by the database. Add missing categories through Admin →
Categories using the names above; their artwork is selected automatically. This
artwork change does not seed, reset, or modify existing category records.

Run `node tests/category-icons.test.mjs` from the repository root to check asset
resolution, aliases, and fallback behavior, and `npm run build` to verify bundling.
