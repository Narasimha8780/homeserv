import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, XCircle, Clock3, FileText, Star } from 'lucide-react';

export const AdminKycTab: React.FC = () => {
  const { captains, categories, approveCaptainKyc, rejectCaptainKyc } = useApp();

  const pending = captains.filter((c) => c.kycStatus === 'pending');
  const reviewed = captains.filter((c) => c.kycStatus !== 'pending');

  const categoryTitles = (ids: string[]) =>
    ids.map((id) => categories.find((c) => c.id === id)?.title).filter(Boolean).join(', ');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-900 mb-3">Captain Verification Queue ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">All caught up! No pending verifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl border border-amber-200 shadow-sm p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300" />
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.phone} • {c.experienceYears} yrs exp • {categoryTitles(c.categories)}</p>
                      <span className="inline-flex items-center space-x-1 mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Clock3 className="w-3 h-3" />
                        <span>Awaiting Review</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => rejectCaptainKyc(c.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveCaptainKyc(c.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-2.5">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="text-xs">
                      <span className="block text-slate-400">ID Number</span>
                      <span className="font-mono font-bold text-slate-800">{c.aadhaarMasked}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 rounded-xl p-2.5">
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="text-xs">
                      <span className="block text-slate-400">Areas Served</span>
                      <span className="font-bold text-slate-800">{c.areas.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-black text-slate-900 mb-3">Reviewed Captains</h2>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100">
          {reviewed.map((c) => (
            <div key={c.id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {c.rating > 0 ? c.rating.toFixed(2) : '—'} • {c.reviewCount} reviews
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  c.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {c.kycStatus}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
