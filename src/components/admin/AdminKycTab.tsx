import React from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { ShieldCheck, XCircle, Clock3, FileText, Star, MapPin } from 'lucide-react';

export const AdminKycTab: React.FC = () => {
  const { captains, categories, allCities, approveCaptainKyc, rejectCaptainKyc } = useApp();

  const pending = captains.filter((c) => c.kycStatus === 'pending');
  const reviewed = captains.filter((c) => c.kycStatus !== 'pending');

  const categoryTitles = (ids: string[]) => ids.map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean).join(', ');
  const cityName = (id: string) => allCities.find((c) => c.id === id)?.name || id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold text-ink mb-4">Verification queue <span className="text-ink-3">({pending.length})</span></h2>
        {pending.length === 0 ? (
          <EmptyState icon={<ShieldCheck className="w-7 h-7" />} title="All caught up!" body="No pending verifications right now." />
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {pending.map((c) => (
              <article key={c.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={c.avatar} name={c.name} className="w-14 h-14 rounded-2xl ring-2 ring-warn/50" />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-ink">{c.name}</h3>
                    <p className="text-[13px] text-ink-3">{c.phone} · {c.experienceYears} yrs · {categoryTitles(c.categories)}</p>
                    <span className="mt-1.5 pill bg-warn-soft text-warn-ink">
                      <Clock3 className="w-3.5 h-3.5" /> Awaiting review
                    </span>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="rounded-2xl bg-surface-2 border border-line p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-ink-3"><FileText className="w-3.5 h-3.5" /> ID number</dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-ink">{c.aadhaarMasked}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-2 border border-line p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-ink-3"><MapPin className="w-3.5 h-3.5" /> {cityName(c.cityId)}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink truncate">{c.areas.join(', ')}</dd>
                  </div>
                </dl>
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <button onClick={() => rejectCaptainKyc(c.id)} className="btn btn-danger h-11">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => approveCaptainKyc(c.id)} className="btn btn-whatsapp h-11">
                    <ShieldCheck className="w-4 h-4" /> Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink mb-3">Reviewed captains</h2>
        <div className="card divide-y divide-line overflow-hidden">
          {reviewed.map((c) => (
            <div key={c.id} className="px-4 py-3.5 flex items-center gap-3">
              <Avatar src={c.avatar} name={c.name} className="w-10 h-10 rounded-xl" textClassName="text-sm" />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink truncate">{c.name}</span>
                <span className="flex items-center gap-1 text-xs text-ink-3">
                  <Star className="w-3 h-3 fill-star text-star" />
                  {c.rating > 0 ? c.rating.toFixed(2) : '—'} · {c.reviewCount} reviews · {cityName(c.cityId)}
                </span>
              </div>
              <span className={`pill uppercase !text-[11px] tracking-wide ${c.kycStatus === 'verified' ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'}`}>
                {c.kycStatus}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
