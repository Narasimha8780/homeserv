import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, ShieldCheck, ShieldAlert, Grid3x3, MapPin } from 'lucide-react';

export const AdminOverviewTab: React.FC = () => {
  const { captains, categories, allCities } = useApp();

  const verifiedCount = captains.filter((c) => c.kycStatus === 'verified').length;
  const pendingCount = captains.filter((c) => c.kycStatus === 'pending').length;
  const totalViews = captains.reduce((sum, c) => sum + c.profileViews, 0);
  const totalClicks = captains.reduce((sum, c) => sum + c.contactClicks, 0);

  const KPI_CARDS = [
    { label: 'Total Captains Listed', value: captains.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Verified Captains', value: verifiedCount, icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Verification', value: pendingCount, icon: ShieldAlert, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Categories', value: categories.filter((c) => c.isActive).length, icon: Grid3x3, color: 'bg-purple-50 text-purple-600' },
  ];

  const cityStats = allCities
    .map((city) => ({ city, count: captains.filter((c) => c.cityId === city.id).length }))
    .sort((a, b) => b.count - a.count);
  const maxCityCount = Math.max(...cityStats.map((c) => c.count), 1);

  const categoryStats = categories
    .map((cat) => ({ title: cat.title, count: captains.filter((c) => c.categories.includes(cat.id)).length }))
    .sort((a, b) => b.count - a.count);
  const maxCatCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      {pendingCount > 0 && (
        <div className="flex items-center space-x-2.5 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{pendingCount} captain{pendingCount !== 1 ? 's' : ''} awaiting ID verification — visit the KYC Queue tab.</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200/70 shadow-premium hover:shadow-premium-lg hover-lift transition-all p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${kpi.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="block text-lg font-black text-slate-900">{kpi.value}</span>
              <span className="block text-[11px] text-slate-500 font-semibold">{kpi.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4">
          <h3 className="text-sm font-black text-slate-900 flex items-center space-x-1.5 mb-3">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Captains by City</span>
          </h3>
          <div className="space-y-3">
            {cityStats.map(({ city, count }) => (
              <div key={city.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{city.name}</span>
                  <span className="font-black text-slate-900">{count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${(count / maxCityCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-premium p-4">
          <h3 className="text-sm font-black text-slate-900 mb-3">Captains by Category</h3>
          <div className="space-y-3">
            {categoryStats.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{cat.title}</span>
                  <span className="font-black text-slate-900">{cat.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full" style={{ width: `${(cat.count / maxCatCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-premium hover:shadow-premium-lg hover-lift transition-all p-4 flex items-center justify-around text-center">
        <div>
          <span className="block text-xl font-black text-slate-900">{totalViews}</span>
          <span className="block text-[11px] text-slate-500 font-semibold">Total Profile Views</span>
        </div>
        <div className="h-10 w-px bg-slate-200" />
        <div>
          <span className="block text-xl font-black text-slate-900">{totalClicks}</span>
          <span className="block text-[11px] text-slate-500 font-semibold">Total Contact Clicks</span>
        </div>
      </div>
    </div>
  );
};
