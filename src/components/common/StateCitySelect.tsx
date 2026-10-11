import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City, LgdPlace } from '../../types';
import { INDIAN_STATES } from '../../data/indianStates';
import { api } from '../../utils/api';
import { Check, Plus, Search, Landmark } from 'lucide-react';

const PLACE_TYPE: Record<LgdPlace['type'], string> = { district: 'District', subdistrict: 'Tehsil', village: 'Village' };

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
  const [places, setPlaces] = useState<{ key: string; list: LgdPlace[] }>({ key: '', list: [] });

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

  // Official LGD places (districts, tehsils, villages) matching what's typed, so anyone can find
  // their exact village even if no one has added it as a city yet.
  const placeQuery = isOpen && selectedState ? effectiveQuery.trim() : '';
  const placeKey = `${selectedState}|${placeQuery.toLowerCase()}`;
  useEffect(() => {
    if (placeQuery.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      api
        .get<LgdPlace[]>(`/locations/search?state=${encodeURIComponent(selectedState)}&q=${encodeURIComponent(placeQuery)}`)
        .then((list) => !cancelled && setPlaces({ key: placeKey, list }))
        .catch(() => !cancelled && setPlaces({ key: placeKey, list: [] }));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [placeQuery, placeKey, selectedState]);

  const placeResults = placeQuery.length >= 2 && places.key === placeKey ? places.list : [];
  const placesLoading = placeQuery.length >= 2 && places.key !== placeKey;
  // Hide places that already exist as a city (same name, and same district when known).
  const newPlaces = placeResults.filter(
    (p) =>
      !citiesInState.some(
        (c) => c.name.toLowerCase() === p.name.toLowerCase() && (!c.district || c.district === (p.type === 'district' ? p.name : p.district))
      )
  );

  const handleAddPlace = async (place: LgdPlace) => {
    if (isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      const city = await addCity(place.name, selectedState, { type: place.type, code: place.code });
      handleSelectCity(city);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this place. Try again.');
    } finally {
      setIsAdding(false);
    }
  };

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
              {(filtered.length > 0 || newPlaces.length === 0) && (
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
                        <span>
                          {city.name}
                          {city.district && <span className="ml-1.5 text-xs text-ink-3 font-normal">{city.district}</span>}
                        </span>
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
              )}

              {newPlaces.length > 0 && (
                <div className="mt-3">
                  <p className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-ink-3">
                    <Landmark className="w-3.5 h-3.5" /> More places in {selectedState}
                  </p>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar rounded-2xl border border-line bg-surface-2 p-1">
                    {newPlaces.map((place) => (
                      <button
                        key={`${place.type}-${place.code}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleAddPlace(place)}
                        disabled={isAdding}
                        className="w-full flex items-center gap-3 text-left px-3.5 py-2.5 rounded-xl hover:bg-surface-3 transition-colors disabled:opacity-60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] text-ink truncate">{place.name}</span>
                          <span className="block text-xs text-ink-3 truncate">
                            {[place.type !== 'district' && place.subdistrict, place.type !== 'district' && place.district]
                              .filter(Boolean)
                              .join(', ') || selectedState}
                          </span>
                        </span>
                        <span className="pill !text-[11px] shrink-0">{PLACE_TYPE[place.type]}</span>
                        <Plus className="w-4 h-4 text-accent shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {effectiveQuery.trim() && !exactMatch && !placesLoading && newPlaces.length === 0 && (
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
