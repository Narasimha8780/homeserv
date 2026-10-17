const assets = import.meta.glob('../assets/subcategory-icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const icons = Object.fromEntries(Object.entries(assets).map(([path, url]) => [
  path.split('/').pop()!.replace('.png', ''), url,
]));

export function getSubcategoryIconUrl(id: string): string | undefined {
  return icons[id];
}
