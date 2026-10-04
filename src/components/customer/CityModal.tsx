import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { City } from '../../types';
import { StateCitySelect } from '../common/StateCitySelect';
import { MapPin, Crosshair, X } from 'lucide-react';

export const CityModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { allCities, selectedCity, setSelectedCity } = useApp();
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    onClose();
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      // Simulate geolocation matching closest Tier 2 hub
      const fallbackCity = allCities.find((c) => c.isActive) || allCities[0];
      if (fallbackCity) setSelectedCity(fallbackCity);
      setIsDetecting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[1.75rem] w-full max-w-lg shadow-premium-lg overflow-hidden border border-white/60 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative overflow-hidden p-5 bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="absolute inset-0 mesh-bg-blue opacity-40 pointer-events-none" />
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-orange-300" />
            </div>
            <div>
              <h3 className="font-black text-lg">Select Your City</h3>
              <p className="text-xs text-zinc-300">All states covered — can't find yours? Just add it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 hover-lift transition-all shadow-premium"
          >
            <Crosshair className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Locating nearest hub...' : 'Detect My City (GPS)'}</span>
          </button>
        </div>

        {/* State -> City picker */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          <StateCitySelect value={selectedCity} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
};
