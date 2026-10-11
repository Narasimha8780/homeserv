import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City, NearestResult } from '../../types';
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet';
import { StateCitySelect } from '../common/StateCitySelect';
import { usePopularCities } from '../../hooks/usePopularCities';
import { api } from '../../utils/api';
import { getCurrentPosition, GeoError } from '../../utils/geolocation';
import { MapPin, LocateFixed, Flame, Navigation, Plus, RotateCw, TriangleAlert } from 'lucide-react';

// Closer than this, the nearest city is picked automatically.
const AUTO_SELECT_KM = 40;
// A city with listed pros wins over an empty one that is only slightly closer.
const PREFER_WITH_PROS_KM = 30;

type Detect =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'error'; message: string }
  | { status: 'result'; result: NearestResult; pick: { city: City; distanceKm: number } | null };

export const CitySheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { captains, selectedCity, setSelectedCity, addCity, t } = useApp();
  const popular = usePopularCities();
  const [detect, setDetect] = useState<Detect>({ status: 'idle' });
  const [isAdding, setIsAdding] = useState(false);

  const close = () => {
    setDetect({ status: 'idle' });
    onClose();
  };

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    close();
  };

  const prosIn = (cityId: string) => captains.filter((c) => c.kycStatus === 'verified' && c.cityId === cityId).length;

  const handleDetect = async () => {
    setDetect({ status: 'locating' });
    try {
      const { lat, lng } = await getCurrentPosition();
      const result = await api.get<NearestResult>(`/locations/nearest?lat=${lat}&lng=${lng}`);
      const nearest = result.cities[0] ?? null;
      const withPros = result.cities.find((c) => prosIn(c.city.id) > 0);
      const pick =
        withPros && nearest && withPros.distanceKm <= nearest.distanceKm + PREFER_WITH_PROS_KM ? withPros : nearest;

      if (pick && pick.distanceKm <= AUTO_SELECT_KM) {
        handleSelect(pick.city);
        return;
      }
      setDetect({ status: 'result', result, pick });
    } catch (err) {
      const code = err instanceof GeoError ? err.code : null;
      setDetect({
        status: 'error',
        message:
          code === 'denied'
            ? 'Location permission is off. Allow location for HomeServ, or pick your city below.'
            : code === 'unsupported'
            ? "This device can't share its location. Pick your city below."
            : code === 'timeout' || code === 'unavailable'
            ? "Couldn't get a GPS fix. Turn on location and try again, or pick your city below."
            : "Couldn't look up your location right now. Pick your city below.",
      });
    }
  };

  const addDetectedPlace = async (result: NearestResult) => {
    if (!result.area || isAdding) return;
    setIsAdding(true);
    try {
      const ref = result.area.approx
        ? { type: 'district' as const, code: result.area.districtCode }
        : { type: 'subdistrict' as const, code: result.area.subdistrictCode };
      const city = await addCity('', result.area.state, ref);
      handleSelect(city);
    } catch {
      setDetect({ status: 'error', message: "Couldn't add your place. Pick it from the list below." });
    } finally {
      setIsAdding(false);
    }
  };

  const area = detect.status === 'result' ? detect.result.area : null;
  // Sub-district names are only shown when they were located precisely and are close by.
  const areaLabel = area
    ? !area.approx && area.distanceKm <= 10
      ? `${area.subdistrict}, ${area.district}`
      : `${area.district} district`
    : null;
  const addLabel = area ? (area.approx ? area.district : area.subdistrict) : null;

  return (
    <Sheet open={open} onClose={close} label={t('selectCity')}>
      <SheetHeader
        title={t('selectCity')}
        subtitle="All states covered — can't find yours? Just add it"
        icon={<MapPin className="w-5 h-5" />}
        onClose={close}
      />
      <SheetBody className="px-5 pb-[calc(1.5rem+var(--sa-bottom))] space-y-6">
        <div className="space-y-3">
          <button onClick={handleDetect} disabled={detect.status === 'locating'} className="btn btn-secondary w-full h-12">
            <LocateFixed className={`w-[18px] h-[18px] text-accent ${detect.status === 'locating' ? 'animate-spin' : ''}`} />
            {detect.status === 'locating' ? 'Finding your location…' : t('detectLocation')}
          </button>

          {detect.status === 'error' && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-warn-soft text-warn-ink p-3.5 text-[13px]" role="alert">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
              <p className="flex-1">{detect.message}</p>
              <button onClick={handleDetect} className="flex items-center gap-1 font-bold shrink-0" aria-label="Try again">
                <RotateCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {detect.status === 'result' && (
            <div className="rounded-2xl border border-line bg-surface-2 p-4 space-y-3 animate-page-enter">
              {areaLabel && (
                <p className="flex items-start gap-2 text-sm text-ink">
                  <Navigation className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    You're in <span className="font-bold">{areaLabel}</span>, {area!.state}
                  </span>
                </p>
              )}
              {detect.pick ? (
                <button onClick={() => handleSelect(detect.pick!.city)} className="btn btn-primary w-full h-11">
                  <MapPin className="w-4 h-4" />
                  Use {detect.pick.city.name} · {Math.round(detect.pick.distanceKm)} km away
                </button>
              ) : (
                <p className="text-[13px] text-ink-3">No HomeServ city near you yet.</p>
              )}
              {area && addLabel && (
                <button onClick={() => addDetectedPlace(detect.result)} disabled={isAdding} className="btn btn-ghost w-full h-10 text-[13px]">
                  <Plus className="w-4 h-4 text-accent" />
                  {isAdding ? 'Adding…' : `Add "${addLabel}" as my city`}
                </button>
              )}
            </div>
          )}
        </div>

        {popular.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink-3 mb-2.5">
              <Flame className="w-3.5 h-3.5 text-accent" /> {t('popularCities')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {popular.map(({ city, count }) => (
                <button key={city.id} onClick={() => handleSelect(city)} aria-pressed={city.id === selectedCity.id} className="chip">
                  {city.name}
                  <span className="opacity-60 font-medium">{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-2.5">Browse by state</h3>
          <StateCitySelect value={selectedCity} onSelect={handleSelect} />
        </section>
      </SheetBody>
    </Sheet>
  );
};
