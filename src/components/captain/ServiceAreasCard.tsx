import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Captain, ServiceArea } from '../../types';
import { Sheet, SheetBody, SheetFooter, SheetHeader } from '../ui/Sheet';
import { ServiceAreaPicker } from './ServiceAreaPicker';
import { describeArea, toServiceAreaInput } from '../../utils/serviceAreas';
import { MapPinned, Pencil, TriangleAlert } from 'lucide-react';

export const ServiceAreasCard: React.FC<{ captain: Captain }> = ({ captain }) => {
  const { updateServiceAreas } = useApp();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ServiceArea[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areas = captain.serviceAreas || [];

  const start = () => {
    setDraft(areas);
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateServiceAreas(captain.id, toServiceAreaInput(draft));
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
          <MapPinned className="w-5 h-5 text-accent" /> Where you work
        </h3>
        <button onClick={start} className="btn btn-secondary h-9 px-3.5 text-[13px]">
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>
      {areas.length === 0 ? (
        <button onClick={start} className="w-full flex items-center gap-2.5 rounded-2xl bg-warn-soft text-warn-ink p-3.5 text-sm text-left">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          Add your district and mandals so nearby customers can find you.
        </button>
      ) : (
        <ul className="space-y-2">
          {areas.map((a) => (
            <li key={a.district.code} className="rounded-2xl bg-surface-2 border border-line px-3.5 py-3 text-sm text-ink">
              {describeArea(a)}
            </li>
          ))}
        </ul>
      )}
      {captain.homePlace && (
        <p className="mt-3 text-xs text-ink-3">
          Home: {[captain.homePlace.village?.name, captain.homePlace.subdistrict.name, captain.homePlace.district.name].filter(Boolean).join(', ')}
        </p>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} label="Where you work">
        <SheetHeader title="Where you work" subtitle="Customers in your mandals see you first" icon={<MapPinned className="w-5 h-5" />} onClose={() => setOpen(false)} />
        <SheetBody className="px-5 pb-4">
          <ServiceAreaPicker value={draft} onChange={setDraft} defaultStateName={areas[0]?.state.name} />
          {error && <p className="mt-3 text-sm text-danger-ink font-semibold">{error}</p>}
        </SheetBody>
        <SheetFooter>
          <button onClick={save} disabled={saving || draft.length === 0} className="btn btn-primary w-full h-12">
            {saving ? 'Saving…' : 'Save areas'}
          </button>
        </SheetFooter>
      </Sheet>
    </section>
  );
};
