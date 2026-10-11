import { useEffect, useState } from 'react';
import type { CodeName } from '../types';
import { api } from '../utils/api';

export type Level = 'states' | 'districts' | 'subdistricts' | 'villages';

// Loads one level of the LGD hierarchy; `key` null = nothing to load yet.
export function useLgdList(level: Level, key: string | null): { list: CodeName[]; loading: boolean } {
  const [state, setState] = useState<{ key: string | null; list: CodeName[] }>({ key: null, list: [] });
  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    const url = level === 'states' ? '/locations/states' : `/locations/${level}?${key}`;
    api
      .get<CodeName[]>(url)
      .then((list) => !cancelled && setState({ key, list }))
      .catch(() => !cancelled && setState({ key, list: [] }));
    return () => {
      cancelled = true;
    };
  }, [level, key]);
  const ready = key !== null && state.key === key;
  return { list: ready ? state.list : [], loading: key !== null && !ready };
}
