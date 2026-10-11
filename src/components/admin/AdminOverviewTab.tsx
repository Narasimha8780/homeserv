import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldCheck, ShieldAlert, Grid3x3, MapPin, Eye, Phone } from 'lucide-react';

const Bars: React.FC<{ rows: { key: string; label: string; count: number }[]; max: number }> = ({ rows, max }) => (
  <div className="space-y-3">
    {rows.map((row) => (
      <div key={row.key}>
        <div className="flex items-center justify-between text-[13px] mb-1.5">
          <span className="font-semibold text-ink-2">{row.label}</span>
          <span className="font-bold text-ink">{row.count}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${(row.count / max) * 100}%` }} />
        </div>
      </div>
    ))}
  </div>
);

export const AdminOverviewTab: React.FC = () => {
  const { captains, categories, allCities, setAdminTab } = useApp();

  const verifiedCount = captains.filter((c) => c.kycStatus === 'verified').length;
  const pendingCount = captains.filter((c) => c.kycStatus === 'pending').length;
  const totalViews = captains.reduce((sum, c) => sum + c.profileViews, 0);
  const totalClicks = captains.reduce((sum, c) => sum + c.contactClicks, 0);

  const KPI_CARDS = [
    { label: 'Captains listed', value: captains.length, icon: Users, cls: 'bg-info-soft text-info-ink' },
    { label: 'Verified', value: verifiedCount, icon: ShieldCheck, cls: 'bg-success-soft text-success-ink' },
    { label: 'Pending verification', value: pendingCount, icon: ShieldAlert, cls: 'bg-warn-soft text-warn-ink' },
    { label: 'Active categories', value: categories.filter((c) => c.isActive).length, icon: Grid3x3, cls: 'bg-accent-soft text-accent-ink' },
    { label: 'Profile views', value: totalViews, icon: Eye, cls: 'bg-surface-3 text-ink-2' },
    { label: 'Contact clicks', value: totalClicks, icon: Phone, cls: 'bg-surface-3 text-ink-2' },
  ];

  const cityStats = allCities
    .map((city) => ({ city, count: captains.filter((c) => c.cityId === city.id).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const maxCityCount = Math.max(...cityStats.map((c) => c.count), 1);

  const categoryStats = categories
    .map((cat) => ({ title: cat.title, count: captains.filter((c) => c.categories.includes(cat.id)).length }))
    .sort((a, b) => b.count - a.count);
  const maxCatCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {pendingCount > 0 && (
        <button onClick={() => setAdminTab('kyc')} className="w-full flex items-center gap-2.5 rounded-2xl p-4 bg-warn-soft text-warn-ink text-sm font-semibold text-left">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          {pendingCount} captain{pendingCount !== 1 ? 's' : ''} awaiting ID verification — open the KYC queue
        </button>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className="card p-4">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.cls}`}>
              <kpi.icon className="w-[18px] h-[18px]" />
            </span>
            <div className="mt-3 font-display text-2xl font-bold text-ink">{kpi.value.toLocaleString('en-IN')}</div>
            <div className="text-xs text-ink-3 font-medium">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink mb-4">
            <MapPin className="w-4 h-4 text-accent" /> Captains by city
          </h3>
          <Bars rows={cityStats.map(({ city, count }) => ({ key: city.id, label: city.name, count }))} max={maxCityCount} />
        </section>
        <section className="card p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink mb-4">
            <Grid3x3 className="w-4 h-4 text-accent" /> Captains by category
          </h3>
          <Bars rows={categoryStats.map((c) => ({ key: c.title, label: c.title, count: c.count }))} max={maxCatCount} />
        </section>
      </div>
    </div>
  );
};
