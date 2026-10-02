// Category icon artwork lives in src/assets/category-icons/<categoryId>.png.
// Bundling via import.meta.glob means we know exactly which categories have an image,
// so categories without artwork (e.g. newly created by an admin) get the fallback tile
// immediately instead of a broken/blank image.
const icons = import.meta.glob('../assets/category-icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const iconById: Record<string, string> = {};
for (const [path, url] of Object.entries(icons)) {
  const id = path.split('/').pop()!.replace('.png', '');
  iconById[id] = url;
}

// Admin-created categories get an id from their title, so fall back to matching on the
// name: "Women's Spa" -> spa artwork, "Men's Spa" / "Barber" -> barber artwork.
const KEYWORD_ICONS: { words: string[]; icon: string }[] = [
  { words: ['women', 'womens', 'woman', 'ladies', 'lady', 'female', 'girls'], icon: 'spa' },
  { words: ['men', 'mens', 'man', 'gents', 'gent', 'male', 'boys', 'barber', 'haircut'], icon: 'barber' },
  { words: ['spa', 'massage', 'salon', 'beauty'], icon: 'spa' },
];

export function getCategoryIconUrl(categoryId: string, title = ''): string | undefined {
  if (iconById[categoryId]) return iconById[categoryId];
  const words = `${categoryId} ${title}`.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  for (const { words: keys, icon } of KEYWORD_ICONS) {
    if (keys.some((k) => words.includes(k))) return iconById[icon];
  }
  return undefined;
}

export const ALL_CATEGORIES_ICON_URL = iconById['all'];
