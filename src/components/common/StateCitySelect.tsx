import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City } from '../../types';
import { INDIAN_STATES } from '../../data/indianStates';
import { Check, Plus, Search } from 'lucide-react';

export const StateCitySelect: React.FC<{
  value: City | null;
  onSelect: (city: City) => void;
}> = ({ value, onSelect }) => {
  const { allCities, addCity } = useApp();
  const [selectedState, setSelectedState] = useState(value?.state || '');
  const [query, setQuery] = useState(value?.state === selectedState ? value?.name || '' : '');
  const [isOpen, setIsOpen] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the input text in sync with the actual selected city (but never while the
  // user is actively typing/searching — isOpen is only true during that interaction).
  useEffect(() => {
    if (!isOpen) {
      setQuery(value && value.state === selectedState ? value.name : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id, selectedState]);

  const citiesInState = useMemo(
    () => allCities.filter((c) => c.state === selectedState && c.isActive),
    [allCities, selectedState]
  );

  // While the field is just showing the already-selected city untouched, browsing
  // should show every city in the state, not just the one that matches the prefilled text.
  const effectiveQuery = hasTyped ? query : '';

  const filtered = useMemo(
    () => citiesInState.filter((c) => c.name.toLowerCase().includes(effectiveQuery.trim().toLowerCase())),
    [citiesInState, effectiveQuery]
  );

  const exactMatch = filtered.some((c) => c.name.toLowerCase() === effectiveQuery.trim().toLowerCase());

  const handleSelectCity = (city: City) => {
    onSelect(city);
    setQuery(city.name);
    setIsOpen(false);
    setHasTyped(false);
  };

  const handleAddCity = async () => {
    if (!effectiveQuery.trim() || !selectedState || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      const city = await addCity(effectiveQuery.trim(), selectedState);
      onSelect(city);
      setQuery(city.name);
      setIsOpen(false);
      setHasTyped(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add city. Try again.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setQuery('');
            setError(null);
            setIsOpen(false);
            setHasTyped(false);
          }}
          className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select state...</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onFocus={() => {
                setIsOpen(true);
                setHasTyped(false);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
                setHasTyped(true);
              }}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              placeholder={`Search cities in ${selectedState}...`}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {isOpen && (
            <>
              <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map((city) => {
                    const isCurrent = value?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm transition-colors ${
                          isCurrent ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{city.name}</span>
                        {isCurrent && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-3 text-xs text-slate-400 text-center">
                    {citiesInState.length === 0
                      ? `No cities listed for ${selectedState} yet.`
                      : 'No matching city found.'}
                  </p>
                )}
              </div>

              {effectiveQuery.trim() && !exactMatch && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleAddCity}
                  disabled={isAdding}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-60"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAdding ? 'Adding...' : `Add "${effectiveQuery.trim()}" as a new city in ${selectedState}`}
                </button>
              )}
            </>
          )}
          {error && <p className="mt-1.5 text-xs text-rose-600 font-semibold">{error}</p>}
        </div>
      )}
    </div>
  );
};
