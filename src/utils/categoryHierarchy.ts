import type { ServiceCategory } from '../types';
import { getCategoryIconUrl } from './categoryIcons';

const KEYS = [
  'electrician', 'plumber', 'driver', 'carpenter', 'painter', 'ac-repair',
  'appliance-repair', 'pest-control', 'insta-help', 'saree-draping',
  'mehendi-service', 'spa', 'interior', 'home-cleaning', 'bridal-makeup',
  'photography', 'events', 'barber',
];
const CHILDREN: Record<string, string[]> = {
  spa: ['saree-draping', 'mehendi-service', 'bridal-makeup'],
  'ac-repair': ['appliance-repair'],
};

function getCategoryKey(id: string, title = ''): string {
  const url = getCategoryIconUrl(id, title);
  return url ? KEYS.find((key) => getCategoryIconUrl(key) === url) || id : id;
}

export function getRootCategoryKey(id: string, title = ''): string {
  const key = getCategoryKey(id, title);
  return Object.keys(CHILDREN).find((parent) => CHILDREN[parent].includes(key)) || key;
}

export function getRootCategories(categories: ServiceCategory[]): ServiceCategory[] {
  return categories.filter((category) =>
    !category.parentId && getCategoryKey(category.id, category.title) === getRootCategoryKey(category.id, category.title)
  );
}

export function getCategoryChildren(parent: ServiceCategory, categories: ServiceCategory[]): ServiceCategory[] {
  const key = getCategoryKey(parent.id, parent.title);
  return categories.filter((category) => category.id !== parent.id && (
    category.parentId === parent.id || (CHILDREN[key] || []).includes(getCategoryKey(category.id, category.title))
  ));
}

export function getCategoryGroupIds(parent: ServiceCategory, categories: ServiceCategory[]): Set<string> {
  return new Set([parent.id, ...getCategoryChildren(parent, categories).filter((category) => category.isActive).map(({ id }) => id)]);
}
