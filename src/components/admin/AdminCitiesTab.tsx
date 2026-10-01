import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Power, Search, Users, MapPin } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-black text-slate-900">City Management</h2>
        <p className="text-xs text-slate-500">
          {activeCount} of {allCities.length} cities active
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-2">
          <input
            type="checkbox"
            checked={showInactiveOnly}
            onChange={(e) => setShowInactiveOnly(e.target.checked)}
            className="rounded"
          />
          Removed only
        </label>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {filtered.length === 0 && (
          <p className="p-6 text-xs text-slate-400 text-center">No cities match this search.</p>
        )}
        {filtered.map((city) => {
          const captainCount = captains.filter((c) => c.cityId === city.id).length;
          return (
            <div key={city.id} className={`p-4 flex items-center justify-between gap-3 ${!city.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{city.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{city.state} · {city.tier}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {captainCount}
                </span>
                <button
                  onClick={() => toggleCityActive(city.id)}
                  title={city.isActive ? 'Remove city' : 'Restore city'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    city.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
