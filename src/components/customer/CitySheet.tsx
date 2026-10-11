import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City } from '../../types';
import { Sheet, SheetBody, SheetHeader } from '../ui/Sheet';
import { StateCitySelect } from '../common/StateCitySelect';
import { usePopularCities } from '../../hooks/usePopularCities';
import { MapPin, LocateFixed, Flame } from 'lucide-react';

export const CitySheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { allCities, selectedCity, setSelectedCity, t } = useApp();
  const popular = usePopularCities();
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    onClose();
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      // Simulated: picks the first active hub (real GPS lookup is not wired up yet).
      const fallbackCity = allCities.find((c) => c.isActive) || allCities[0];
      if (fallbackCity) setSelectedCity(fallbackCity);
      setIsDetecting(false);
      onClose();
    }, 700);
  };

  return (
    <Sheet open={open} onClose={onClose} label={t('selectCity')}>
      <SheetHeader
        title={t('selectCity')}
        subtitle="All states covered — can't find yours? Just add it"
        icon={<MapPin className="w-5 h-5" />}
        onClose={onClose}
      />
      <SheetBody className="px-5 pb-[calc(1.5rem+var(--sa-bottom))] space-y-6">
        <button onClick={handleAutoDetect} disabled={isDetecting} className="btn btn-secondary w-full h-12">
          <LocateFixed className={`w-[18px] h-[18px] text-accent ${isDetecting ? 'animate-spin' : ''}`} />
          {isDetecting ? 'Locating nearest hub…' : t('detectLocation')}
        </button>

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
