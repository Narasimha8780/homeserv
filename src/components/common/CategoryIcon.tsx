import React, { useState } from 'react';
import { Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert, Sofa, Truck, Briefcase, Headset, Sparkles, Hand, Flower2, BrushCleaning, Camera, PartyPopper } from 'lucide-react';
import { getCategoryIconUrl } from '../../utils/categoryIcons';

const FALLBACK_ICONS: Record<string, React.ElementType> = {
  Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert, Sofa, Truck, Briefcase, Headset, Sparkles, Hand, Flower2, BrushCleaning, Camera, PartyPopper,
};

// Uses the generated icon image when one exists for this category id; categories an
// admin creates later (no image yet) fall back to a gradient tile with a lucide icon.
// The artwork has its own rounded-square background, so the radius here clips its corners.
export const CategoryIcon: React.FC<{
  categoryId: string;
  title: string;
  iconName: string;
  colorClass: string;
  className?: string;
  iconClassName?: string;
}> = ({ categoryId, title, iconName, colorClass, className = 'w-16 h-16', iconClassName = 'w-7 h-7' }) => {
  const [failed, setFailed] = useState(false);
  const url = getCategoryIconUrl(categoryId, title);
  const Fallback = FALLBACK_ICONS[iconName] || Briefcase;

  if (failed || !url) {
    return (
      <span className={`${className} rounded-[24%] bg-gradient-to-br ${colorClass} text-white flex items-center justify-center shrink-0`}>
        <Fallback className={iconClassName} />
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-cover rounded-[24%] shrink-0`}
    />
  );
};
