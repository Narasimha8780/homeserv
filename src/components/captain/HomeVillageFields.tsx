import React, { useState } from 'react';
import type { CodeName, ServiceArea } from '../../types';
import { useLgdList } from '../../hooks/useLgdList';

// Optional: the captain's own village, chosen from the districts they serve.
export const HomeVillageFields: React.FC<{
  areas: ServiceArea[];
  value: { subdistrictCode: number; villageCode?: number } | null;
  onChange: (home: { subdistrictCode: number; villageCode?: number } | null) => void;
}> = ({ areas, value, onChange }) => {
  const [districtCode, setDistrictCode] = useState<number>(areas[0].district.code);
  const area = areas.find((a) => a.district.code === districtCode) || areas[0];
  const fetched = useLgdList('subdistricts', area.wholeDistrict ? `district=${area.district.code}` : null);
  const mandals: CodeName[] = area.wholeDistrict ? fetched.list : area.subdistricts;
  const villages = useLgdList('villages', value ? `subdistrict=${value.subdistrictCode}` : null);

  return (
    <div className="rounded-2xl bg-surface-2 border border-line p-3.5 space-y-2.5">
      <p className="text-sm font-semibold text-ink">
        Your home village <span className="text-ink-3 font-normal">(optional)</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {areas.length > 1 && (
          <select
            aria-label="Home district"
            className="input"
            value={area.district.code}
            onChange={(e) => {
              setDistrictCode(Number(e.target.value));
              onChange(null);
            }}
          >
            {areas.map((a) => (
              <option key={a.district.code} value={a.district.code}>{a.district.name}</option>
            ))}
          </select>
        )}
        <select
          aria-label="Home mandal"
          className="input"
          value={value?.subdistrictCode ?? ''}
          onChange={(e) => onChange(e.target.value ? { subdistrictCode: Number(e.target.value) } : null)}
        >
          <option value="">{fetched.loading ? 'Loading…' : 'Mandal…'}</option>
          {mandals.map((m) => (
            <option key={m.code} value={m.code}>{m.name}</option>
          ))}
        </select>
        <select
          aria-label="Home village"
          className="input"
          disabled={!value}
          value={value?.villageCode ?? ''}
          onChange={(e) => value && onChange({ subdistrictCode: value.subdistrictCode, ...(e.target.value ? { villageCode: Number(e.target.value) } : {}) })}
        >
          <option value="">{villages.loading ? 'Loading…' : 'Village…'}</option>
          {villages.list.map((v) => (
            <option key={v.code} value={v.code}>{v.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
