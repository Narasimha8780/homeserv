import React, { useMemo, useState } from 'react';
import type { CodeName, ServiceArea } from '../../types';
import { useLgdList } from '../../hooks/useLgdList';
import { Switch } from '../ui/Switch';
import { Check, MapPin, Plus, Search, X } from 'lucide-react';
import { MAX_DISTRICTS } from '../../utils/serviceAreas';


// Captains choose where they work: one or more districts, each either whole or specific mandals.
export const ServiceAreaPicker: React.FC<{
  value: ServiceArea[];
  onChange: (areas: ServiceArea[]) => void;
  defaultStateName?: string;
}> = ({ value, onChange, defaultStateName }) => {
  const [adding, setAdding] = useState(value.length === 0);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const save = (area: ServiceArea) => {
    const next = [...value];
    const existing = next.findIndex((a) => a.district.code === area.district.code);
    if (editIndex !== null) next[editIndex] = area;
    else if (existing >= 0) next[existing] = area;
    else next.push(area);
    onChange(next);
    setAdding(false);
    setEditIndex(null);
  };

  return (
    <div className="space-y-3">
      {value.map((area, i) =>
        editIndex === i ? (
          <AreaEditor key={area.district.code} initial={area} onSave={save} onCancel={() => setEditIndex(null)} />
        ) : (
          <div key={area.district.code} className="rounded-2xl border border-line bg-surface-2 p-3.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-ink">
                  {area.district.name} <span className="text-ink-3 font-normal text-[13px]">· {area.state.name}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {area.wholeDistrict ? (
                    <span className="pill bg-accent-soft text-accent-ink">Whole district</span>
                  ) : (
                    area.subdistricts.map((s) => (
                      <span key={s.code} className="pill">
                        {s.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <button type="button" onClick={() => setEditIndex(i)} className="btn btn-ghost h-8 px-2.5 text-[13px]">
                Edit
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="icon-btn w-8 h-8"
                aria-label={`Remove ${area.district.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      )}

      {adding ? (
        <AreaEditor
          defaultStateName={value[0]?.state.name || defaultStateName}
          taken={value.map((a) => a.district.code)}
          onSave={save}
          onCancel={value.length ? () => setAdding(false) : undefined}
        />
      ) : (
        value.length < MAX_DISTRICTS &&
        editIndex === null && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-secondary w-full h-11 !border-dashed">
            <Plus className="w-4 h-4 text-accent" />
            {value.length ? 'Add another district' : 'Add a district'}
          </button>
        )
      )}
    </div>
  );
};

const AreaEditor: React.FC<{
  initial?: ServiceArea;
  defaultStateName?: string;
  taken?: number[];
  onSave: (area: ServiceArea) => void;
  onCancel?: () => void;
}> = ({ initial, defaultStateName, taken = [], onSave, onCancel }) => {
  const [state, setState] = useState<CodeName | null>(initial?.state || null);
  const [district, setDistrict] = useState<CodeName | null>(initial?.district || null);
  const [whole, setWhole] = useState(initial?.wholeDistrict ?? false);
  const [picked, setPicked] = useState<CodeName[]>(initial?.subdistricts || []);
  const [query, setQuery] = useState('');

  const states = useLgdList('states', '');
  const effectiveState = state || states.list.find((s) => s.name === defaultStateName) || null;
  const districts = useLgdList('districts', effectiveState ? `stateCode=${effectiveState.code}` : null);
  const mandals = useLgdList('subdistricts', district ? `district=${district.code}` : null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? mandals.list.filter((m) => m.name.toLowerCase().includes(q)) : mandals.list;
  }, [mandals.list, query]);

  const toggle = (m: CodeName) =>
    setPicked((prev) => (prev.some((p) => p.code === m.code) ? prev.filter((p) => p.code !== m.code) : [...prev, m]));

  const canSave = !!(effectiveState && district && (whole || picked.length));

  return (
    <div className="rounded-2xl border border-orange-400/40 bg-accent-soft/40 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="field-label" htmlFor="sa-state">State</label>
          <select
            id="sa-state"
            className="input"
            value={effectiveState?.code ?? ''}
            disabled={!!initial}
            onChange={(e) => {
              setState(states.list.find((s) => s.code === Number(e.target.value)) || null);
              setDistrict(null);
              setPicked([]);
            }}
          >
            <option value="">{states.loading ? 'Loading…' : 'Select…'}</option>
            {states.list.map((s) => (
              <option key={s.code} value={s.code}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="sa-district">District</label>
          <select
            id="sa-district"
            className="input"
            value={district?.code ?? ''}
            disabled={!effectiveState || !!initial}
            onChange={(e) => {
              if (!state && effectiveState) setState(effectiveState);
              setDistrict(districts.list.find((d) => d.code === Number(e.target.value)) || null);
              setPicked([]);
            }}
          >
            <option value="">{districts.loading ? 'Loading…' : 'Select…'}</option>
            {districts.list
              .filter((d) => !taken.includes(d.code) || d.code === initial?.district.code)
              .map((d) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
          </select>
        </div>
      </div>

      {district && (
        <>
          <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 border border-line px-3.5 py-2.5">
            <span>
              <span className="block text-sm font-semibold text-ink">I work in the whole district</span>
              <span className="block text-xs text-ink-3">Or pick the mandals you travel to</span>
            </span>
            <Switch checked={whole} onChange={setWhole} label="Whole district" />
          </div>

          {!whole && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="field-label !mb-0">Mandals / Tehsils</span>
                <span className="text-xs font-semibold text-accent-ink">{picked.length} selected</span>
              </div>
              {mandals.list.length > 8 && (
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mandals…" className="input !min-h-10 !py-2 !pl-10 !text-sm" />
                </div>
              )}
              <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                {mandals.loading && <span className="text-sm text-ink-3">Loading mandals…</span>}
                {shown.map((m) => {
                  const on = picked.some((p) => p.code === m.code);
                  return (
                    <button key={m.code} type="button" aria-pressed={on} onClick={() => toggle(m)} className="chip">
                      {on && <Check className="w-3.5 h-3.5" />}
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-2 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost h-10 px-4">
            Cancel
          </button>
        )}
        <button
          type="button"
          disabled={!canSave}
          onClick={() =>
            canSave &&
            onSave({
              state: effectiveState!,
              district: district!,
              wholeDistrict: whole,
              subdistricts: whole ? [] : [...picked].sort((a, b) => a.name.localeCompare(b.name)),
            })
          }
          className="btn btn-primary h-10 px-4 flex-1"
        >
          <Check className="w-4 h-4" />
          {!district ? 'Choose a district' : whole || picked.length ? `Save ${district.name}` : 'Pick at least one mandal'}
        </button>
      </div>
    </div>
  );
};
