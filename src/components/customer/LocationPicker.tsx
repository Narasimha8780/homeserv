import React, { useMemo, useState } from 'react';
import type { CodeName, PickedPlace } from '../../types';
import { useLgdList } from '../../hooks/useLgdList';
import { Check, ChevronRight, Search } from 'lucide-react';

const Step: React.FC<{ n: number; label: string; done: boolean; children: React.ReactNode }> = ({ n, label, done, children }) => (
  <div className="flex gap-3">
    <span
      className={`w-7 h-7 mt-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        done ? 'bg-success text-white' : 'bg-surface-3 text-ink-3'
      }`}
    >
      {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : n}
    </span>
    <div className="flex-1 min-w-0">
      <span className="field-label">{label}</span>
      {children}
    </div>
  </div>
);

const Select: React.FC<{
  value: number | '';
  onChange: (item: CodeName | null) => void;
  items: CodeName[];
  loading: boolean;
  placeholder: string;
  id: string;
}> = ({ value, onChange, items, loading, placeholder, id }) => (
  <select
    id={id}
    value={value}
    disabled={loading}
    onChange={(e) => onChange(items.find((i) => i.code === Number(e.target.value)) || null)}
    className="input"
  >
    <option value="">{loading ? 'Loading…' : placeholder}</option>
    {items.map((i) => (
      <option key={i.code} value={i.code}>
        {i.name}
      </option>
    ))}
  </select>
);

// State → District → Mandal/Tehsil → Village, from the official LGD list.
export const LocationPicker: React.FC<{
  initial?: Partial<PickedPlace> | null;
  initialStateName?: string;
  busy?: boolean;
  onConfirm: (place: PickedPlace) => void;
}> = ({ initial, initialStateName, busy, onConfirm }) => {
  const [stateSel, setStateSel] = useState<CodeName | null>(initial?.state || null);
  const [district, setDistrict] = useState<CodeName | null>(initial?.district || null);
  const [subdistrict, setSubdistrict] = useState<CodeName | null>(initial?.subdistrict || null);
  const [village, setVillage] = useState<CodeName | null>(initial?.village || null);
  const [villageQuery, setVillageQuery] = useState('');

  const states = useLgdList('states', '');
  // Until the user picks one, default to the state of the city they're browsing.
  const effectiveState = stateSel || states.list.find((s) => s.name === initialStateName) || null;
  const districtList = useLgdList('districts', effectiveState ? `stateCode=${effectiveState.code}` : null);
  const subdistricts = useLgdList('subdistricts', district ? `district=${district.code}` : null);
  const villages = useLgdList('villages', subdistrict ? `subdistrict=${subdistrict.code}` : null);

  // Some mandals have two villages with the same name; show their LGD code to tell them apart.
  const duplicateNames = useMemo(() => {
    const seen = new Map<string, number>();
    villages.list.forEach((v) => seen.set(v.name, (seen.get(v.name) || 0) + 1));
    return new Set([...seen].filter(([, n]) => n > 1).map(([name]) => name));
  }, [villages.list]);

  const filteredVillages = useMemo(() => {
    const q = villageQuery.trim().toLowerCase();
    return q ? villages.list.filter((v) => v.name.toLowerCase().includes(q)) : villages.list;
  }, [villages.list, villageQuery]);

  const pickState = (s: CodeName | null) => {
    setStateSel(s);
    setDistrict(null);
    setSubdistrict(null);
    setVillage(null);
  };
  const pickDistrict = (d: CodeName | null) => {
    if (!stateSel && effectiveState) setStateSel(effectiveState);
    setDistrict(d);
    setSubdistrict(null);
    setVillage(null);
  };
  const pickSubdistrict = (sd: CodeName | null) => {
    setSubdistrict(sd);
    setVillage(null);
    setVillageQuery('');
  };

  const canConfirm = !!(effectiveState && district && subdistrict);
  const placeName = village?.name || subdistrict?.name;

  return (
    <div className="space-y-4">
      <Step n={1} label="State" done={!!effectiveState}>
        <Select id="lp-state" value={effectiveState?.code ?? ''} onChange={pickState} items={states.list} loading={states.loading} placeholder="Select state…" />
      </Step>

      {effectiveState && (
        <Step n={2} label="District" done={!!district}>
          <Select id="lp-district" value={district?.code ?? ''} onChange={pickDistrict} items={districtList.list} loading={districtList.loading} placeholder="Select district…" />
        </Step>
      )}

      {district && (
        <Step n={3} label="Mandal / Tehsil / Taluk" done={!!subdistrict}>
          <Select id="lp-subdistrict" value={subdistrict?.code ?? ''} onChange={pickSubdistrict} items={subdistricts.list} loading={subdistricts.loading} placeholder="Select mandal…" />
        </Step>
      )}

      {subdistrict && (
        <Step n={4} label="Village (optional)" done={!!village}>
          <div className="relative">
            <Search className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              id="lp-village-search"
              value={villageQuery}
              onChange={(e) => setVillageQuery(e.target.value)}
              placeholder={villages.loading ? 'Loading villages…' : `Search ${villages.list.length} villages in ${subdistrict.name}…`}
              className="input !pl-11"
              autoComplete="off"
            />
          </div>
          <div className="mt-2 max-h-56 overflow-y-auto custom-scrollbar rounded-2xl border border-line bg-surface-2 p-1" role="listbox" aria-label="Villages">
            <button
              type="button"
              role="option"
              aria-selected={!village}
              onClick={() => setVillage(null)}
              className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-[15px] transition-colors ${
                !village ? 'bg-accent-soft text-accent-ink font-semibold' : 'text-ink hover:bg-surface-3'
              }`}
            >
              Whole of {subdistrict.name}
              {!village && <Check className="w-4 h-4" />}
            </button>
            {filteredVillages.slice(0, 300).map((v) => (
              <button
                key={v.code}
                type="button"
                role="option"
                aria-selected={village?.code === v.code}
                onClick={() => setVillage(v)}
                className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-[15px] transition-colors ${
                  village?.code === v.code ? 'bg-accent-soft text-accent-ink font-semibold' : 'text-ink hover:bg-surface-3'
                }`}
              >
                <span>
                  {v.name}
                  {duplicateNames.has(v.name) && <span className="ml-1.5 text-xs font-normal text-ink-3">#{v.code}</span>}
                </span>
                {village?.code === v.code && <Check className="w-4 h-4" />}
              </button>
            ))}
            {!villages.loading && filteredVillages.length === 0 && (
              <p className="px-3 py-3 text-sm text-ink-3 text-center">No village matches "{villageQuery}".</p>
            )}
            {filteredVillages.length > 300 && (
              <p className="px-3 py-2 text-xs text-ink-3 text-center">Type to narrow down {filteredVillages.length} villages…</p>
            )}
          </div>
        </Step>
      )}

      <button
        type="button"
        disabled={!canConfirm || busy}
        onClick={() =>
          canConfirm &&
          onConfirm({ state: effectiveState!, district: district!, subdistrict: subdistrict!, ...(village ? { village } : {}) })
        }
        className="btn btn-primary w-full h-12"
      >
        {busy ? 'Finding pros near you…' : canConfirm ? `Show pros near ${placeName}` : 'Choose your mandal to continue'}
        {canConfirm && !busy && <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
};
