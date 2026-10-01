import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert, Power, Plus, Users } from 'lucide-react';

const FALLBACK_ICONS: Record<string, React.ElementType> = {
  Fan, Zap, Wrench, Car, Hammer, Paintbrush, Tv, ShieldAlert,
};
const ICON_CHOICES = Object.keys(FALLBACK_ICONS);

export const AdminCategoriesTab: React.FC = () => {
  const { categories, captains, toggleCategoryActive, addCategory } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState(ICON_CHOICES[0]);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addCategory(newTitle.trim(), newIcon);
    setNewTitle('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-lg font-black text-slate-900">Category Management</h2>

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="New category name (e.g. Mason)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 min-w-[180px] text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
        >
          {ICON_CHOICES.map((icon) => (
            <option key={icon} value={icon}>{icon}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium divide-y divide-slate-100">
        {categories.map((cat) => {
          const captainCount = captains.filter((c) => c.categories.includes(cat.id)).length;
          return (
            <div key={cat.id} className={`p-4 flex items-center justify-between gap-3 ${!cat.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <CategoryIcon categoryId={cat.id} title={cat.title} iconName={cat.iconName} colorClass={cat.color} className="w-10 h-10" iconClassName="w-4 h-4" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.title}</h3>
                  <p className="text-[11px] text-slate-500">{cat.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  {captainCount} {captainCount === 1 ? 'captain' : 'captains'}
                </span>
                <button
                  onClick={() => toggleCategoryActive(cat.id)}
                  title={cat.isActive ? 'Disable category' : 'Enable category'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    cat.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
