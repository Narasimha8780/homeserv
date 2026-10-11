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
    <div className="space-y-3">
      <div>
        <label className="field-label" htmlFor="state-select">State</label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setQuery('');
            setError(null);
            setIsOpen(false);
            setHasTyped(false);
          }}
          className="input"
        >
          <option value="">Select state…</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {selectedState && (
        <div>
          <label className="field-label" htmlFor="city-search">City</label>
          <div className="relative">
            <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              id="city-search"
              type="text"
              value={query}
              autoComplete="off"
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
              placeholder={`Search cities in ${selectedState}…`}
              className="input !pl-11"
            />
          </div>

          {isOpen && (
            <>
              <div className="mt-2 max-h-56 overflow-y-auto custom-scrollbar rounded-2xl border border-line bg-surface-2 p-1">
                {filtered.length > 0 ? (
                  filtered.map((city) => {
                    const isCurrent = value?.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-[15px] transition-colors ${
                          isCurrent ? 'bg-accent-soft text-accent-ink font-semibold' : 'text-ink hover:bg-surface-3'
                        }`}
                      >
                        <span>{city.name}</span>
                        {isCurrent && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-4 text-sm text-ink-3 text-center">
                    {citiesInState.length === 0 ? `No cities listed for ${selectedState} yet.` : 'No matching city found.'}
                  </p>
                )}
              </div>

              {effectiveQuery.trim() && !exactMatch && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleAddCity}
                  disabled={isAdding}
                  className="btn btn-secondary mt-2 w-full h-11 text-[13px] !border-dashed"
                >
                  <Plus className="w-4 h-4 text-accent" />
                  {isAdding ? 'Adding…' : `Add “${effectiveQuery.trim()}” as a new city in ${selectedState}`}
                </button>
              )}
            </>
          )}
          {error && <p className="mt-1.5 text-sm text-danger-ink font-semibold">{error}</p>}
        </div>
      )}
    </div>
  );
};
