import type { SelectHTMLAttributes } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { Select } from './Field';

interface RegionSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value: string;
  onChange: (regionId: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  /** Text for the empty option, e.g. "All regions". Omit to force a choice. */
  emptyLabel?: string;
  containerClassName?: string;
}

/** Province/city picker; major cities are grouped first. */
export function RegionSelect({ value, onChange, emptyLabel, ...props }: RegionSelectProps) {
  const { regions, loading } = useRegions();
  const cities = regions.filter((r) => r.isCity);
  const provinces = regions.filter((r) => !r.isCity);

  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={loading} {...props}>
      <option value="">{loading ? 'Loading regions…' : (emptyLabel ?? 'Choose a region')}</option>
      {cities.length > 0 && (
        <optgroup label="Cities">
          {cities.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </optgroup>
      )}
      {provinces.length > 0 && (
        <optgroup label="Provinces">
          {provinces.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </optgroup>
      )}
    </Select>
  );
}
