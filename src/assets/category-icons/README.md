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
| Beauty & Personal Care | `spa.png` |
| Interior | `interior.png` |
| Painters | `painter.png` |
| Home Cleaning | `home-cleaning.png` |
| Bridal Makeup | `bridal-makeup.png` |
| Photography | `photography.png` |
| Events | `events.png` |
| Men’s Salon | `barber.png` |

`src/utils/categoryIcons.ts` bundles assets by filename and matches common title
variants for admin-created categories. Existing All, Barber, AC Repair, and
Appliance Repair artwork is retained. Unknown categories use the existing Lucide
fallback.

Categories are supplied by the database. API startup adds missing default services
while preserving existing IDs, active settings, and professional references.
Common existing name variants are recognized to avoid duplicate services.
Existing women’s spa categories are renamed to Beauty & Personal Care; men’s spa
and salon categories are renamed to Men’s Salon, keeping their existing IDs.
AC & Appliance Repair groups the repair categories. Saree, mehendi, and bridal
makeup categories are nested under Beauty & Personal Care. Fresh
demo seeds use the same catalogue. AC Repair and Appliance Repair are retained.
Custom categories can still be added through Admin → Categories.

Run `node tests/category-icons.test.mjs` from the repository root to check asset
resolution, aliases, and fallback behavior, and `npm run build` to verify bundling.
