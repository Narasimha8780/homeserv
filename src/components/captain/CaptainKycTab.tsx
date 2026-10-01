import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Clock3, XCircle, FileText } from 'lucide-react';

export const CaptainKycTab: React.FC = () => {
  const { currentCaptain, t } = useApp();
  if (!currentCaptain) return null;

  const statusMeta = {
    verified: { label: t('kycStatusVerified'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: ShieldCheck },
    pending: { label: t('kycStatusPending'), color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock3 },
    rejected: { label: 'Rejected — Action Needed', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle },
  }[currentCaptain.kycStatus];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className={`rounded-3xl border p-5 flex items-center gap-4 ${statusMeta.color}`}>
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs">
          <StatusIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-black text-sm">{statusMeta.label}</h2>
          <p className="text-xs opacity-80 mt-0.5">
            {currentCaptain.kycStatus === 'verified'
              ? 'Your ID has been verified. Your profile is visible to customers in your city.'
              : currentCaptain.kycStatus === 'pending'
              ? 'Our team typically reviews new listings within 24-48 hours.'
              : 'Please contact support to re-submit your ID document.'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-black text-slate-900">Aadhaar / ID Document</h3>
        </div>
        <div className="p-4 flex items-center gap-4">
          {currentCaptain.aadhaarDocUrl ? (
            <img src={currentCaptain.aadhaarDocUrl} alt="ID document" className="w-20 h-20 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
              <FileText className="w-8 h-8" />
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500">ID Number</p>
            <p className="text-sm font-mono font-bold text-slate-900">{currentCaptain.aadhaarMasked}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
