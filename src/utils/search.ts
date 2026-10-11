import type { Captain } from '../types';

// Every word of the query must appear somewhere in the captain's name, services, areas or bio.
export const matchesQuery = (cap: Captain, q: string, categoryTitle: (id: string) => string) => {
  if (!q) return true;
  const haystack = [cap.name, ...cap.categories.map(categoryTitle), ...cap.areas, cap.bio].join(' ').toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
};
