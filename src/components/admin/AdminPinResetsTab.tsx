import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { EmptyState } from '../ui/EmptyState';
import { KeyRound, Phone, Check, X, RefreshCw, User, Wrench } from 'lucide-react';

type Role = 'customer' | 'captain';

interface ResetRequest {
  id: string;
  name: string;
  phone: string;
  requestedAt: string;
}

const timeAgo = (iso: string) => {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

export const AdminPinResetsTab: React.FC = () => {
  const [customers, setCustomers] = useState<ResetRequest[]>([]);
  const [captains, setCaptains] = useState<ResetRequest[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get<{ customers: ResetRequest[]; captains: ResetRequest[] }>('/auth/pin-resets');
        if (cancelled) return;
        setCustomers(data.customers);
        setCaptains(data.captains);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load reset requests.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const load = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const act = async (role: Role, id: string, action: 'approve' | 'dismiss') => {
    setBusyId(id);
    setError(null);
    try {
      await api.post(`/auth/pin-resets/${role}/${id}/${action}`, {});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const total = customers.length + captains.length;

  const renderGroup = (role: Role, items: ResetRequest[]) => (
    <section key={role}>
      <h2 className="text-xl font-bold text-ink mb-4 flex items-center gap-2">
        {role === 'captain' ? <Wrench className="w-5 h-5 text-ink-3" /> : <User className="w-5 h-5 text-ink-3" />}
        {role === 'captain' ? 'Captains' : 'Customers'} <span className="text-ink-3">({items.length})</span>
      </h2>
      <div className="grid lg:grid-cols-2 gap-4">
        {items.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-2xl bg-warn-soft text-warn-ink flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-ink truncate">{r.name}</h3>
                <a href={`tel:${r.phone}`} className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-ink">
                  <Phone className="w-3.5 h-3.5" /> {r.phone}
                </a>
                <p className="text-xs text-ink-3 mt-0.5">Requested {timeAgo(r.requestedAt)}</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-2 rounded-2xl bg-surface-2 border border-line p-3">
              Call this number first to confirm it's really them. Clearing the PIN lets anyone with this number set a new
              one by signing up again.
            </p>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button onClick={() => act(role, r.id, 'dismiss')} disabled={busyId === r.id} className="btn btn-ghost h-11 border border-line">
                <X className="w-4 h-4" /> Dismiss
              </button>
              <button onClick={() => act(role, r.id, 'approve')} disabled={busyId === r.id} className="btn btn-primary h-11">
                <Check className="w-4 h-4" /> {busyId === r.id ? 'Working…' : 'Clear PIN'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">PIN reset requests</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">Verify the person by phone, then clear their PIN.</p>
        </div>
        <button onClick={load} disabled={isLoading} className="btn btn-ghost h-10 px-3.5 border border-line text-[13px]">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && <p className="text-sm text-danger-ink font-semibold">{error}</p>}

      {!isLoading && total === 0 && (
        <EmptyState icon={<KeyRound className="w-7 h-7" />} title="Nothing pending" body="No one has asked for a PIN reset." />
      )}

      {captains.length > 0 && renderGroup('captain', captains)}
      {customers.length > 0 && renderGroup('customer', customers)}
    </div>
  );
};
