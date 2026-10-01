import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City } from '../../types';
import { MapPin, Check, Crosshair, Search, X, Sparkles } from 'lucide-react';

export const CityModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { allCities, selectedCity, setSelectedCity, t } = useApp();
  const [filter, setFilter] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const filteredCities = allCities.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) || 
    c.state.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    onClose();
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      // Simulate geolocation matching closest Tier 2 hub
      setSelectedCity(allCities[0]); // Jaipur
      setIsDetecting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-lg">{t('selectCity')}</h3>
              <p className="text-xs text-blue-200">Currently serving Tier 1, 2 & Semi-Urban Cities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button + Search */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
          >
            <Crosshair className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Locating nearest hub...' : t('detectLocation')}</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search your city or state..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* City Grid */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredCities.map((city) => {
              const isCurrent = city.id === selectedCity.id;
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/80 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{city.name}</span>
                      <span className="text-xs text-slate-500 block">{city.state}</span>
                    </div>
                    {isCurrent && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                      Pop: {city.population}
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                      {city.tier}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Expanding to 25+ more cities in Phase 2 launch!</span>
        </div>
      </div>
    </div>
  );
};
