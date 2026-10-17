import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { Switch } from '../ui/Switch';
import { Plus, Users } from 'lucide-react';

const ICON_CHOICES = ['Fan', 'Zap', 'Wrench', 'Car', 'Hammer', 'Paintbrush', 'Tv', 'ShieldAlert'];

export const AdminCategoriesTab: React.FC = () => {
  const { categories, captains, toggleCategoryActive, addCategory } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState(ICON_CHOICES[0]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isAdding) return;
    setIsAdding(true);
    setError(null);
    try {
      await addCategory(newTitle.trim(), newIcon);
      setNewTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add category');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <form onSubmit={handleAdd} className="card p-4 sm:p-5">
        <h2 className="text-base font-bold text-ink mb-3">Add a category</h2>
        <div className="flex flex-wrap gap-2.5">
          <input
            type="text"
            placeholder="New category name (e.g. Mason)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input flex-1 min-w-[12rem]"
          />
          <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="input !w-auto" aria-label="Fallback icon">
            {ICON_CHOICES.map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
          <button type="submit" disabled={!newTitle.trim() || isAdding} className="btn btn-primary h-12 px-5">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger-ink font-semibold">{error}</p>}
      </form>

      <div className="card divide-y divide-line overflow-hidden">
        {categories.map((cat) => {
          const captainCount = captains.filter((c) => c.categories.includes(cat.id)).length;
          return (
            <div key={cat.id} className="px-4 py-3.5 flex items-center gap-3">
              <span className={cat.isActive ? '' : 'opacity-40 grayscale'}>
                <CategoryIcon categoryId={cat.id} title={cat.title} iconName={cat.iconName} colorClass={cat.color} className="w-11 h-11" iconClassName="w-5 h-5" />
              </span>
              <div className={`min-w-0 flex-1 ${cat.isActive ? '' : 'opacity-50'}`}>
                <h3 className="text-sm font-semibold text-ink">{cat.title}</h3>
                <p className="text-xs text-ink-3 truncate">{cat.parentId ? `Under ${categories.find((parent) => parent.id === cat.parentId)?.title || cat.parentId} · ` : ''}{cat.tagline}</p>
              </div>
              <span className="hidden sm:flex items-center gap-1 text-xs text-ink-3">
                <Users className="w-3.5 h-3.5" /> {captainCount}
              </span>
              <Switch checked={cat.isActive} onChange={() => toggleCategoryActive(cat.id)} label={`${cat.title} active`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
