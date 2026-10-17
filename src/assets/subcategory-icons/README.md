# Sub-service artwork

58 individual 192 × 192 PNG assets. Filenames match the stable service IDs in
`src/data/serviceSubcategories.ts`; no contact details, labels, prices or timing
claims are embedded in the artwork. Beauty, men’s salon, plumbing, appliance and electrician tiles use individual background colours and softly shaded
illustrations matching the supplied reference. The UI supplies accessible text labels and
rounded corners. Original main category and launcher icons are retained.

| Parent category | Service examples |
| --- | ---: |
| AC & Appliance Repair | 11 |
| Beauty & Personal Care | 10 |
| Men's Salon | 5 |
| Pest Control | 2 |
| Each of the other 10 main categories | 3 |

The appliance section follows the reference's Large appliances / Other appliances
groups. Beauty uses Facials and Saree Draping / Pre-pleating, with Saree Draping,
Mehendi Services and Bridal Makeup & Hairstyling nested here rather than on the
home screen. Existing category IDs and professional references are preserved.

These are descriptive service examples. Providers are listed by their registered
category; customers should confirm the exact work directly with a professional.

Run `node tests/subcategory-icons.test.mjs` to verify all assets, uniqueness,
dimensions, category counts, aliases and the parent/child grouping.
