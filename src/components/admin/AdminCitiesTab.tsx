import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Switch } from '../ui/Switch';
import { Search, Users, MapPin } from 'lucide-react';

export const AdminCitiesTab: React.FC = () => {
  const { allCities, captains, toggleCityActive } = useApp();
  const [query, setQuery] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCities
      .filter((c) => (showInactiveOnly ? !c.isActive : true))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
  }, [allCities, query, showInactiveOnly]);

  const activeCount = allCities.filter((c) => c.isActive).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[14rem]">
          <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input type="text" placeholder="Search by city or state…" value={query} onChange={(e) => setQuery(e.target.value)} className="input !pl-11" />
        </div>
        <button onClick={() => setShowInactiveOnly((v) => !v)} aria-pressed={showInactiveOnly} className="chip h-12 !px-4">
          Removed only
        </button>
        <span className="text-[13px] text-ink-3 font-medium">
          {activeCount} of {allCities.length} active
        </span>
      </div>

      <div className="card divide-y divide-line max-h-[65vh] overflow-y-auto custom-scrollbar">
        {filtered.length === 0 && <p className="p-8 text-sm text-ink-3 text-center">No cities match this search.</p>}
        {filtered.map((city) => {
          const captainCount = captains.filter((c) => c.cityId === city.id).length;
          return (
            <div key={city.id} className="px-4 py-3 flex items-center gap-3">
              <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${city.isActive ? 'bg-accent-soft text-accent-ink' : 'bg-surface-3 text-ink-3'}`}>
                <MapPin className="w-[18px] h-[18px]" />
              </span>
              <div className={`min-w-0 flex-1 ${city.isActive ? '' : 'opacity-50'}`}>
                <h3 className="text-sm font-semibold text-ink truncate">{city.name}</h3>
                <p className="text-xs text-ink-3 truncate">{city.state} · {city.tier}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-ink-3">
                <Users className="w-3.5 h-3.5" /> {captainCount}
              </span>
              <Switch checked={city.isActive} onChange={() => toggleCityActive(city.id)} label={`${city.name} active`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
