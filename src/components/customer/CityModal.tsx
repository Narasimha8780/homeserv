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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-lg">Select Your City</h3>
              <p className="text-xs text-blue-200">All states covered — can't find yours? Just add it</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-xs"
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
