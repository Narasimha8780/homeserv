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

export function getCategoryIconUrl(categoryId: string): string | undefined {
  return iconById[categoryId];
}

export const ALL_CATEGORIES_ICON_URL = iconById['all'];
