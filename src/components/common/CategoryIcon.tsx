import React, { useState } from 'react';
import { Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert, Sofa, Truck, Briefcase } from 'lucide-react';
import { getCategoryIconUrl } from '../../utils/categoryIcons';

const FALLBACK_ICONS: Record<string, React.ElementType> = {
  Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert, Sofa, Truck, Briefcase,
};

// Uses the generated icon image when one exists for this category id; categories an
// admin creates later (no image yet) fall back to a gradient tile with a lucide icon.
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
      <span className={`${className} rounded-2xl bg-gradient-to-br ${colorClass} text-white flex items-center justify-center shadow-premium shrink-0`}>
        <Fallback className={iconClassName} />
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={title}
      onError={() => setFailed(true)}
      className={`${className} object-cover rounded-2xl shrink-0 shadow-premium`}
    />
  );
};
