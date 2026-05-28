import React, { useEffect, useMemo, useState } from 'react';
import { Search, Bell, ChevronDown, RotateCcw, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type RiseRow = Record<string, unknown>;

const SUPABASE_PAGE_SIZE = 1000;

const toText = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());
const toNumber = (v: unknown) => {
  if (typeof v === 'number') return v;
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

const pickValue = (row: RiseRow, keys: string[]) => {
  for (const k of keys) {
    const v = row[k];
    if (v !== null && v !== undefined && String(v).trim() !== '') return v;
  }
  // loose match by normalized key
  const normalized = Object.keys(row).reduce<Record<string, string>>((acc, cur) => {
    acc[cur.replace(/[^a-z0-9]/gi, '').toLowerCase()] = cur;
    return acc;
  }, {});
  for (const k of keys) {
    const nk = k.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const real = normalized[nk];
    if (real && row[real] !== undefined) return row[real];
  }
  return '';
};

const pickNumericValue = (row: RiseRow, keys: string[]) => toNumber(pickValue(row, keys));

type SummaryRow = {
  label: string;
  sections?: string[];
  zero: number;
  lt1000: number;
  r1000_1500: number;
  r1500_2000: number;
  achieved: number;
  grand_total: number;
  active: number;
  non_active: number;
  above_six: number;
  isGrandTotal?: boolean;
};

const fallbackRiseRows: RiseRow[] = [
  {
    'Circle New': 'North',
    'Section New': 'A1',
    'New WD Code': 'WD-1001',
    'Achv Slabs-': '<1000',
    Status: 'Active',
    'Above 6': 1,
  },
  {
    'Circle New': 'North',
    'Section New': 'A2',
    'New WD Code': 'WD-1002',
    'Achv Slabs-': '1000-1500',
    Status: 'Active',
    'Above 6': 0,
  },
  {
    'Circle New': 'South',
    'Section New': 'B1',
    'New WD Code': 'WD-1003',
    'Achv Slabs-': 'Achieved',
    Status: 'Non Active',
    'Above 6': 2,
  },
  {
    'Circle New': 'South',
    'Section New': 'B2',
    'New WD Code': 'WD-1004',
    'Achv Slabs-': 'Zero',
    Status: 'Active',
    'Above 6': 0,
  },
];

function Header() {
  return (
    <header className="flex-shrink-0 border-b border-[rgba(203,213,225,0.7)] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f1ff] border border-[#cfe0ff] text-[#2563eb] font-bold">
            ITC
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-medium leading-tight">Rack Billing</div>
            <div className="text-[10px] text-gray-500 mt-0.5">Rack Billing Performance</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="pl-8 pr-2 py-1.5 border rounded text-sm w-40" placeholder="Search..." />
          </div>
          <button className="h-8 w-8 rounded-lg border border-[rgba(203,213,225,0.7)] bg-white flex items-center justify-center hover:bg-gray-50">
            <Bell className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

function DashboardToggle({ active, onChange }: { active: 'section' | 'wdcode'; onChange: (v: 'section' | 'wdcode') => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[rgba(203,213,225,0.8)] bg-[#f8fafc] p-1">
      <button onClick={() => onChange('section')} className={`${active === 'section' ? 'bg-[#2563eb] text-white shadow-sm' : 'text-gray-700'} px-3 py-1.5 rounded-lg text-sm font-medium transition`}>
        Section
      </button>
      <button onClick={() => onChange('wdcode')} className={`${active === 'wdcode' ? 'bg-[#2563eb] text-white shadow-sm' : 'text-gray-700'} px-3 py-1.5 rounded-lg text-sm font-medium transition`}>
        WD Code
      </button>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[rgba(203,213,225,0.7)] bg-white p-3 min-h-[108px] flex flex-col justify-between">
      <div className="text-[9px] leading-snug text-gray-500 mb-2">{label}</div>
      <div className="mt-auto text-[22px] font-medium leading-none text-[#2563eb]">{value}</div>
    </div>
  );
}

function FilterChip({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((s) => !s)} className="h-9 w-full rounded-lg border border-[rgba(203,213,225,0.8)] bg-white px-3 text-[11px] font-medium shadow-sm sm:w-auto flex items-center gap-2">
        <span>{label}</span>
        {selected.length > 0 && <span className="rounded bg-blue-600 px-2 text-[10px] text-white">{selected.length}</span>}
        <ChevronDown className={`h-3 w-3 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-40 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-[rgba(203,213,225,0.8)] bg-white p-2 shadow-lg sm:w-60">
          {options.length === 0 && <div className="text-xs text-gray-500">No options</div>}
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={selected.includes(o)} onChange={() => onToggle(o)} />
              <span className="text-sm">{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RackBillingPage() {
  const [active, setActive] = useState<'section' | 'wdcode'>('section');
  const [rows, setRows] = useState<RiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const [filters, setFilters] = useState({ circle_new: [] as string[], section_new: [] as string[], new_wd_code: [] as string[] });
  const [options, setOptions] = useState({ circle_new: [] as string[], section_new: [] as string[], new_wd_code: [] as string[] });

  useEffect(() => {
    let activeFlag = true;
    const load = async () => {
      setLoading(true);
      const tableRows: RiseRow[] = [];
      let from = 0;
      let fetchError: string | null = null;

      while (true) {
        const to = from + SUPABASE_PAGE_SIZE - 1;
        const { data, error } = await supabase.from('RackBilling').select('*').range(from, to);

        if (error) {
          fetchError = error.message;
          break;
        }

        const page = (data ?? []) as RiseRow[];
        tableRows.push(...page);

        if (page.length < SUPABASE_PAGE_SIZE) {
          break;
        }

        from += SUPABASE_PAGE_SIZE;
      }

      const d = tableRows.length > 0 ? tableRows : fallbackRiseRows;
      setRows(d);
      setUsingFallback(Boolean(fetchError) || tableRows.length === 0);
      if (fetchError) console.error(fetchError);
      setOptions({
        circle_new: Array.from(new Set(d.map((r) => toText(pickValue(r, ['Circle New']))))).filter(Boolean).sort(),
        section_new: Array.from(new Set(d.map((r) => toText(pickValue(r, ['Section New']))))).filter(Boolean).sort(),
        new_wd_code: Array.from(new Set(d.map((r) => toText(pickValue(r, ['New WD Code']))))).filter(Boolean).sort(),
      });
      setLoading(false);
    };
    void load();
    return () => { activeFlag = false; };
  }, []);

  const buckets = useMemo(() => [
    { key: 'zero', labels: ['Zero'] },
    { key: 'lt1000', labels: ['<1000'] },
    { key: 'r1000_1500', labels: ['1000-1500'] },
    { key: 'r1500_2000', labels: ['1500-2000'] },
    { key: 'achieved', labels: ['Achieved'] },
  ], []);

  const slabKeyByLabel = useMemo(() => ({
    zero: 'Zero',
    lt1000: '<1000',
    r1000_1500: '1000-1500',
    r1500_2000: '1500-2000',
    achieved: 'Achieved',
  }), []);

  const data = useMemo(() => {
    const filtered = rows.filter((r) => {
      const c = toText(pickValue(r, ['Circle New', 'circle_new', 'circle']));
      const s = toText(pickValue(r, ['Section New', 'section_new', 'section']));
      const w = toText(pickValue(r, ['New WD Code', 'new_wd_code', 'wd_code', 'wdcode']));
      if (filters.circle_new.length && !filters.circle_new.includes(c)) return false;
      if (filters.section_new.length && !filters.section_new.includes(s)) return false;
      if (filters.new_wd_code.length && !filters.new_wd_code.includes(w)) return false;
      return true;
    });

    const map = new Map<string, SummaryRow>();

    if (active === 'section') {
      for (const r of filtered) {
        const label = toText(pickValue(r, ['Section New']));
        if (!label) continue;
        const cur = map.get(label) ?? { label, zero: 0, lt1000: 0, r1000_1500: 0, r1500_2000: 0, achieved: 0, grand_total: 0, active: 0, non_active: 0, above_six: 0 } as SummaryRow;
        const slab = toText(pickValue(r, ['Achv Slabs-', 'Achv Slabs']));
        const slabKey = Object.entries(slabKeyByLabel).find(([, value]) => value.toLowerCase() === slab.toLowerCase())?.[0] as keyof SummaryRow | undefined;
        if (slabKey) (cur as any)[slabKey] = ((cur as any)[slabKey] ?? 0) + 1;
        const status = toText(pickValue(r, ['Status'])).toLowerCase();
        if (status === 'active') cur.active += 1;
        if (status === 'issue outlet' || status === 'non active' || status === 'inactive') cur.non_active += 1;
        cur.grand_total += 1;
        cur.above_six += toNumber(pickValue(r, ['Above 6']));
        map.set(label, cur);
      }
    } else {
      // wdcode grouping
      for (const r of filtered) {
        const wd = toText(pickValue(r, ['New WD Code']));
        if (!wd) continue;
        const section = toText(pickValue(r, ['Section New']));
        const cur = map.get(wd) ?? { label: wd, sections: [], zero: 0, lt1000: 0, r1000_1500: 0, r1500_2000: 0, achieved: 0, grand_total: 0, active: 0, non_active: 0, above_six: 0 } as SummaryRow;
        if (section && !cur.sections?.includes(section)) cur.sections = [...(cur.sections ?? []), section];
        const slab = toText(pickValue(r, ['Achv Slabs-', 'Achv Slabs']));
        const slabKey = Object.entries(slabKeyByLabel).find(([, value]) => value.toLowerCase() === slab.toLowerCase())?.[0] as keyof SummaryRow | undefined;
        if (slabKey) (cur as any)[slabKey] = ((cur as any)[slabKey] ?? 0) + 1;
        const status = toText(pickValue(r, ['Status'])).toLowerCase();
        if (status === 'active') cur.active += 1;
        if (status === 'issue outlet' || status === 'non active' || status === 'inactive') cur.non_active += 1;
        cur.grand_total += 1;
        cur.above_six += toNumber(pickValue(r, ['Above 6']));
        map.set(wd, cur);
      }
    }

    const arr = Array.from(map.values());
    const grand = arr.reduce((acc, row) => {
      for (const b of buckets) (acc as any)[b.key] = ((acc as any)[b.key] ?? 0) + ((row as any)[b.key] ?? 0);
      acc.grand_total += row.grand_total ?? 0;
      acc.active += row.active ?? 0;
      acc.non_active += row.non_active ?? 0;
      acc.above_six += row.above_six ?? 0;
      return acc;
    }, { label: 'Grand Total', zero: 0, lt1000: 0, r1000_1500: 0, r1500_2000: 0, achieved: 0, grand_total: 0, active: 0, non_active: 0, above_six: 0 } as SummaryRow);

    return [...arr.sort((a, b) => String(a.label).localeCompare(String(b.label))), { ...grand, isGrandTotal: true }];
  }, [rows, filters, active, buckets]);

  const summaryCounts = useMemo(() => {
    const rowsOnly = data.filter((row) => !row.isGrandTotal);
    const achievedCount = rowsOnly.reduce((sum, row) => sum + (row.achieved ?? 0), 0);
    const aboveSixCount = rowsOnly.reduce((sum, row) => sum + (row.above_six ?? 0), 0);
    const nonActiveCount = rowsOnly.reduce((sum, row) => sum + (row.non_active ?? 0), 0);

    return { achievedCount, aboveSixCount, nonActiveCount };
  }, [data]);

  const onNavigateToWdcode = (sectionLabel: string) => {
    setActive('wdcode');
    setFilters((p) => ({ ...p, section_new: [sectionLabel] }));
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[var(--color-text-primary)] flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-24">
        {usingFallback && (
          <div className="mb-3 rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-900">
            Showing hard-coded demo data because the live table was empty or unavailable.
          </div>
        )}

        <div className="mb-3 rounded-[12px] border border-[rgba(203,213,225,0.7)] bg-white p-3 pb-10 relative">
          <button
            onClick={() => setFilters({ circle_new: [], section_new: [], new_wd_code: [] })}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-[7px] border border-[#cfe0ff] bg-[#eff6ff] px-2 py-1 text-[10px] font-medium text-[#2563eb]"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>

          <DashboardToggle active={active} onChange={setActive} />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <FilterChip label="Circle New" options={options.circle_new} selected={filters.circle_new} onToggle={(v) => setFilters((p) => ({ ...p, circle_new: p.circle_new.includes(v) ? p.circle_new.filter((x) => x !== v) : [...p.circle_new, v] }))} />
            {active === 'wdcode' && (
              <FilterChip label="Section New" options={options.section_new} selected={filters.section_new} onToggle={(v) => setFilters((p) => ({ ...p, section_new: p.section_new.includes(v) ? p.section_new.filter((x) => x !== v) : [...p.section_new, v] }))} />
            )}
            <FilterChip label="New WD Code" options={options.new_wd_code} selected={filters.new_wd_code} onToggle={(v) => setFilters((p) => ({ ...p, new_wd_code: p.new_wd_code.includes(v) ? p.new_wd_code.filter((x) => x !== v) : [...p.new_wd_code, v] }))} />
          </div>
        </div>

        {loading ? (
          <div className="rounded-[12px] border border-[rgba(203,213,225,0.7)] bg-white p-4 text-sm text-gray-500">Loading rack billing data...</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <MetricCard label="Achieve Count" value={summaryCounts.achievedCount.toLocaleString()} />
              <MetricCard label="Above 6" value={summaryCounts.aboveSixCount.toLocaleString()} />
              <MetricCard label="Non Active" value={summaryCounts.nonActiveCount.toLocaleString()} />
            </div>

            <div className="rounded-[12px] border border-[rgba(203,213,225,0.7)] bg-white overflow-hidden">
              <div className="px-3 py-2 border-b border-[rgba(203,213,225,0.7)] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium">Rack Billing Summary</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{data.length} Records</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] table-fixed border-collapse">
                  <thead className="bg-[#f8fafc] sticky top-0 z-10">
                    <tr>
                      <th className="p-2 text-left text-[10px] font-medium text-gray-500 whitespace-nowrap">{active === 'section' ? 'Section New' : 'WD Code'}</th>
                      {active === 'wdcode' && <th className="p-2 text-left text-[10px] font-medium text-gray-500">Sections</th>}
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Zero</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">&lt;1000</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">1000-1500</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">1500-2000</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Achieved</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Grand Total</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Active</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Non Active</th>
                      <th className="p-2 text-right text-[10px] font-medium text-gray-500">Above Six</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, idx) => (
                      <tr key={idx} className={`${r.isGrandTotal ? 'bg-[#f8fafc] font-semibold' : ''} border-t border-[rgba(203,213,225,0.5)] hover:bg-[#f8fafc]`} onClick={() => { if (active === 'section' && !r.isGrandTotal) onNavigateToWdcode(r.label); }}>
                        <td className="p-2 text-[11px] whitespace-nowrap">{r.label}</td>
                        {active === 'wdcode' && <td className="p-2 text-[11px] text-gray-500">{(r.sections ?? []).join(', ')}</td>}
                        <td className="p-2 text-right text-[11px]">{(r.zero ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.lt1000 ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.r1000_1500 ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.r1500_2000 ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.achieved ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.grand_total ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.active ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.non_active ?? 0).toLocaleString()}</td>
                        <td className="p-2 text-right text-[11px]">{(r.above_six ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
