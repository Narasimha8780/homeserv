import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City, NearbyCity, NearestResult, PickedPlace } from '../../types';
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet';
import { LocationPicker } from './LocationPicker';
import { usePopularCities } from '../../hooks/usePopularCities';
import { api } from '../../utils/api';
import { getCurrentPosition, GeoError } from '../../utils/geolocation';
import { chooseNearbyCity, distanceLabel, NEARBY_RADIUS_KM } from '../../utils/nearby';
import { MapPin, LocateFixed, Flame, Navigation, Plus, RotateCw, TriangleAlert } from 'lucide-react';

type Notice =
  | { kind: 'error'; message: string }
  | { kind: 'none-nearby'; placeName: string; result: NearestResult; place: PickedPlace | null };

export const CitySheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { cityCounts, selectedCity, setSelectedCity, selectedPlace, setSelectedPlace, addCity, t } = useApp();
  const popular = usePopularCities();
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [gpsPlace, setGpsPlace] = useState<Partial<PickedPlace> | null>(null);

  const close = () => {
    setNotice(null);
    setGpsPlace(null);
    onClose();
  };

  const prosIn = (cityId: string) => cityCounts[cityId] || 0;

  // Show pros from `nearby.city`, remembering the customer's own place (if any).
  const chooseCity = (nearby: NearbyCity | { city: City }, place: PickedPlace | null) => {
    setSelectedCity(nearby.city);
    setSelectedPlace(
      place && 'distanceKm' in nearby
        ? {
            ...place,
            servedBy: { cityId: nearby.city.id, cityName: nearby.city.name, distanceKm: nearby.distanceKm, sameDistrict: nearby.sameDistrict },
          }
        : null
    );
    close();
  };

  // Plain city choice (popular chips): no specific village/mandal.
  const pickCity = (city: City) => chooseCity({ city }, null);

  const resolve = (result: NearestResult, place: PickedPlace | null, placeName: string) => {
    const pick = chooseNearbyCity(result.cities, prosIn);
    if (pick) chooseCity(pick, place);
    else setNotice({ kind: 'none-nearby', placeName, result, place });
  };

  const handlePicked = async (place: PickedPlace) => {
    setBusy(true);
    setNotice(null);
    try {
      const result = await api.get<NearestResult>(`/locations/nearest?subdistrict=${place.subdistrict.code}`);
      resolve(result, place, place.village?.name || place.subdistrict.name);
    } catch {
      setNotice({ kind: 'error', message: "Couldn't look up pros near this place. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  const handleDetect = async () => {
    setLocating(true);
    setNotice(null);
    try {
      const { lat, lng } = await getCurrentPosition();
      const result = await api.get<NearestResult>(`/locations/nearest?lat=${lat}&lng=${lng}`);
      const area = result.area;
      // Only trust the mandal when it was located precisely and is close; otherwise prefill the
      // district and let the user choose their mandal/village below.
      const precise = area && !area.approx && area.distanceKm <= 5;
      const place: PickedPlace | null =
        area && precise
          ? {
              state: { code: area.stateCode, name: area.state },
              district: { code: area.districtCode, name: area.district },
              subdistrict: { code: area.subdistrictCode, name: area.subdistrict },
            }
          : null;
      if (area) {
        setGpsPlace({
          state: { code: area.stateCode, name: area.state },
          district: { code: area.districtCode, name: area.district },
          ...(precise ? { subdistrict: { code: area.subdistrictCode, name: area.subdistrict } } : {}),
        });
      }
      resolve(result, place, place?.subdistrict.name || (area ? `${area.district} district` : 'you'));
    } catch (err) {
      const code = err instanceof GeoError ? err.code : null;
      setNotice({
        kind: 'error',
        message:
          code === 'denied'
            ? 'Location permission is off. Allow location for HomeServ, or choose your place below.'
            : code === 'unsupported'
            ? "This device can't share its location. Choose your place below."
            : code === 'timeout' || code === 'unavailable'
            ? "Couldn't get a GPS fix. Turn on location and try again, or choose your place below."
            : "Couldn't look up your location right now. Choose your place below.",
      });
    } finally {
      setLocating(false);
    }
  };

  const addOwnPlace = async (n: Extract<Notice, { kind: 'none-nearby' }>) => {
    const area = n.result.area;
    if (!area) return;
    setBusy(true);
    try {
      const city = await addCity('', area.state, area.approx ? { type: 'district', code: area.districtCode } : { type: 'subdistrict', code: area.subdistrictCode });
      chooseCity({ city, distanceKm: 0, sameDistrict: true }, n.place);
    } catch {
      setNotice({ kind: 'error', message: "Couldn't add your place. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const nearest = notice?.kind === 'none-nearby' ? notice.result.cities[0] : null;

  return (
    <Sheet open={open} onClose={close} label={t('selectCity')}>
      <SheetHeader
        title="Choose your location"
        subtitle={`We'll show pros within ${NEARBY_RADIUS_KM} km of your village or mandal`}
        icon={<MapPin className="w-5 h-5" />}
        onClose={close}
      />
      <SheetBody className="px-5 pb-[calc(1.5rem+var(--sa-bottom))] space-y-6">
        <div className="space-y-3">
          <button onClick={handleDetect} disabled={locating || busy} className="btn btn-secondary w-full h-12">
            <LocateFixed className={`w-[18px] h-[18px] text-accent ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Finding your location…' : t('detectLocation')}
          </button>

          {notice?.kind === 'error' && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-warn-soft text-warn-ink p-3.5 text-[13px]" role="alert">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-px" />
              <p className="flex-1">{notice.message}</p>
              <button onClick={handleDetect} className="flex items-center gap-1 font-bold shrink-0">
                <RotateCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {notice?.kind === 'none-nearby' && (
            <div className="rounded-2xl border border-line bg-surface-2 p-4 space-y-3 animate-page-enter" role="status">
              <p className="flex items-start gap-2 text-sm text-ink">
                <Navigation className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  No HomeServ city within {NEARBY_RADIUS_KM} km of <span className="font-bold">{notice.placeName}</span> yet.
                </span>
              </p>
              {nearest && (
                <button onClick={() => chooseCity(nearest, notice.place)} className="btn btn-primary w-full h-11">
                  <MapPin className="w-4 h-4" />
                  Show {nearest.city.name} · {distanceLabel(nearest.distanceKm)}
                </button>
              )}
              {notice.result.area && (
                <button onClick={() => addOwnPlace(notice)} disabled={busy} className="btn btn-ghost w-full h-10 text-[13px]">
                  <Plus className="w-4 h-4 text-accent" />
                  {busy ? 'Adding…' : `Add "${notice.result.area.approx ? notice.result.area.district : notice.result.area.subdistrict}" as a new city`}
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
                <button key={city.id} onClick={() => pickCity(city)} aria-pressed={!selectedPlace && city.id === selectedCity.id} className="chip">
                  {city.name}
                  <span className="opacity-60 font-medium">{count}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-3">Or choose step by step</h3>
          <LocationPicker
            key={JSON.stringify(gpsPlace)}
            initial={gpsPlace || selectedPlace}
            initialStateName={selectedCity.state}
            busy={busy}
            onConfirm={handlePicked}
          />
        </section>
      </SheetBody>
    </Sheet>
  );
};
