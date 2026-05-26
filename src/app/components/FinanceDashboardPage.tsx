import { useEffect, useRef, useState } from 'react';
import { BarChart3, Bell, User, Search, ChevronDown, RotateCcw, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type SourceRow = Record<string, unknown>;

type MarketRow = {
  circle: string;
  district: string;
  section: string;
  marketPopGroup: string;
  marketIdKey: string;
  marketId: number;
  l3m: number;
  geo: number;
};

const L3M_OPTS = ["0","1"];
const GEO_OPTS = ["0","1"];
const MARKET_TABLES = ['Market', 'market'];
const SUPABASE_PAGE_SIZE = 1000;

function normalizeKeyName(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pickValue(row: SourceRow, keys: string[]) {
  const normalizedRowEntries = Object.entries(row).map(([k, v]) => [normalizeKeyName(k), v] as const);

  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }

    const normalizedKey = normalizeKeyName(key);
    const looseMatch = normalizedRowEntries.find(([k]) => k === normalizedKey)?.[1];
    if (looseMatch !== null && looseMatch !== undefined && String(looseMatch).trim() !== '') {
      return looseMatch;
    }
  }

  return '';
}

function toText(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMarketRow(row: SourceRow): MarketRow {
  const circle = toText(pickValue(row, ['Circle name', 'Circle Name', 'circle_name', 'circle', 'Circle']));
  const district = toText(pickValue(row, ['District', 'district']));
  const section = toText(pickValue(row, ['Section name', 'Section Name', 'section_name', 'section', 'Section']));
  const marketPopGroup = toText(pickValue(row, ['MARKET_POP_GROUP', 'Market Pop Group', 'market_pop_group', 'marketPopGroup']));

  const marketIdRaw = pickValue(row, ['Distinct Market ID', 'Market ID', 'market_id', 'marketId', 'Market_ID']);
  const marketIdKey = toText(marketIdRaw);
  const marketIdNum = toNumber(marketIdRaw);

  return {
    circle,
    district,
    section,
    marketPopGroup,
    marketIdKey,
    marketId: marketIdNum > 0 ? marketIdNum : 0,
    l3m: toNumber(pickValue(row, [
      "L3M Coverage with Threshhold (1/0) May '26",
      "L3M Coverage with Threshold (1/0) May '26",
      "L3M May '26",
      'l3m',
      'L3M',
      'l3m_coverage'
    ])),
    geo: toNumber(pickValue(row, ['Geo Q4 25-26', 'Geo Q4 25–26', 'geo', 'geo_q4_25_26'])),
  };
}

function avail(rows: MarketRow[], field: keyof MarketRow, filters: Record<string, string[]>) {
  let base = rows;
  if (filters.circle?.length) base = base.filter((r: any) => filters.circle.includes(r.circle));
  if (filters.district?.length) base = base.filter((r: any) => filters.district.includes(r.district));
  if (filters.section?.length) base = base.filter((r: any) => filters.section.includes(r.section));
  if (filters.marketPopGroup?.length) base = base.filter((r: any) => filters.marketPopGroup.includes(r.marketPopGroup));
  return [...new Set(base.map((r: any) => r[field]))].sort() as string[];
}

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

type DropdownProps = {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  openId: string | null;
  setOpenId: (id: string | null) => void;
};

function Dropdown({ id, label, options, selected, onToggle, openId, setOpenId }: DropdownProps) {
  const isOpen = openId === id;
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 150, dropUp: false });

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropUp = spaceBelow < 220;
      const w = Math.max(rect.width, 150);
      const left = Math.min(rect.left, window.innerWidth - w - 8);
      setPos({ top: dropUp ? rect.top - 4 : rect.bottom + 4, left, width: w, dropUp });
    }
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); setOpenId(isOpen ? null : id); }}
        style={{
          width: '100%', height: 36, borderRadius: 8,
          border: '0.5px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          padding: '0 8px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer',
          fontSize: 11, fontWeight: 500, color: 'var(--color-text-primary)', gap: 4
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
          {selected.length
            ? <span style={{ color: '#2563eb' }}>{selected.length} selected</span>
            : label}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: pos.dropUp ? undefined : pos.top,
            bottom: pos.dropUp ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            width: pos.width,
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 8,
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.14)',
            zIndex: 9999,
            maxHeight: 200,
            overflowY: 'auto',
            backdropFilter: 'none'
          }}
        >
          {options.length === 0
            ? <div style={{ padding: '9px 12px', fontSize: 12, color: 'var(--color-text-secondary)' }}>No options</div>
            : options.map(v => (
              <div
                key={v}
                onClick={() => onToggle(v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', fontSize: 12, cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  background: selected.includes(v) ? '#eff6ff' : '#ffffff',
                  borderBottom: '0.5px solid rgba(203, 213, 225, 0.6)'
                }}
              >
                <span>{v}</span>
                {selected.includes(v) && <Check size={13} color="#2563eb" />}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function WdMdpDashboard() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, setRows] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selCircle, setSelCircle] = useState<string[]>([]);
  const [selDistrict, setSelDistrict] = useState<string[]>([]);
  const [selSection, setSelSection] = useState<string[]>([]);
  const [selMarketPopGroup, setSelMarketPopGroup] = useState<string[]>([]);
  const [selL3m, setSelL3m] = useState<string[]>([]);
  const [selGeo, setSelGeo] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadMarketRows = async () => {
    setLoading(true);
    setFetchError(null);

    let fetched: SourceRow[] = [];
    let lastError: string | null = null;

    for (const table of MARKET_TABLES) {
      const tableRows: SourceRow[] = [];
      let from = 0;
      let tableFailed = false;

      while (true) {
        const to = from + SUPABASE_PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .range(from, to);

        if (error) {
          lastError = `Table ${table}: ${error.message}`;
          tableFailed = true;
          console.warn(`Market fetch attempt failed for table \"${table}\":`, error.message);
          break;
        }

        const page = (data ?? []) as SourceRow[];
        tableRows.push(...page);

        if (page.length < SUPABASE_PAGE_SIZE) {
          break;
        }

        from += SUPABASE_PAGE_SIZE;
      }

      if (!tableFailed) {
        fetched = tableRows;
        lastError = null;
        break;
      }
    }

    if (lastError) {
      console.error('Failed to fetch Market data:', lastError);
      setRows([]);
      setFetchError(lastError);
      setLoading(false);
      return;
    }

    const normalized = fetched.map(normalizeMarketRow);

    setRows(normalized);
    setLoading(false);
  };

  useEffect(() => {
    void loadMarketRows();
  }, []);

  useEffect(() => {
    const close = () => setOpenId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const availCircles = avail(rows, 'circle', {});
  const availDistricts = avail(rows, 'district', { circle: selCircle });
  const availSections = avail(rows, 'section', { circle: selCircle, district: selDistrict });
  const availMarketPopGroups = avail(rows, 'marketPopGroup', {
    circle: selCircle,
    district: selDistrict,
    section: selSection,
  });

  const filtered = rows.filter((r: any) => {
    if (selCircle.length && !selCircle.includes(r.circle)) return false;
    if (selDistrict.length && !selDistrict.includes(r.district)) return false;
    if (selSection.length && !selSection.includes(r.section)) return false;
    if (selMarketPopGroup.length && !selMarketPopGroup.includes(r.marketPopGroup)) return false;
    if (selL3m.length && !selL3m.includes(String(r.l3m > 0 ? 1 : 0))) return false;
    if (selGeo.length && !selGeo.includes(String(r.geo > 0 ? 1 : 0))) return false;
    return true;
  });

  const summarized = (() => {
    const grouped = new Map<string, {
      circle: string;
      district: string;
      section: string;
      marketIds: Set<string>;
      l3m: number;
      geo: number;
    }>();

    for (const r of filtered) {
      const key = `${r.circle}||${r.district}||${r.section}`;
      const existing = grouped.get(key);

      if (!existing) {
        const seed = {
          circle: r.circle,
          district: r.district,
          section: r.section,
          marketIds: new Set<string>(),
          l3m: 0,
          geo: 0,
        };

        if (r.marketIdKey) seed.marketIds.add(r.marketIdKey);
        else if (r.marketId > 0) seed.marketIds.add(String(r.marketId));
        seed.l3m += r.l3m > 0 ? 1 : 0;
        seed.geo += r.geo > 0 ? 1 : 0;
        grouped.set(key, seed);
        continue;
      }

      if (r.marketIdKey) existing.marketIds.add(r.marketIdKey);
      else if (r.marketId > 0) existing.marketIds.add(String(r.marketId));
      existing.l3m += r.l3m > 0 ? 1 : 0;
      existing.geo += r.geo > 0 ? 1 : 0;
    }

    return Array.from(grouped.values()).map((g) => ({
      circle: g.circle,
      district: g.district,
      section: g.section,
      marketId: g.marketIds.size,
      l3m: g.l3m,
      geo: g.geo,
    }));
  })();

  const totalMkt = summarized.reduce((a: number, r: any) => a + r.marketId, 0);
  const totalL3m = summarized.reduce((a: number, r: any) => a + r.l3m, 0);
  const totalGeo = summarized.reduce((a: number, r: any) => a + r.geo, 0);

  const l3mPct = totalMkt > 0 ? ((totalL3m / totalMkt) * 100).toFixed(1) + '%' : '0%';
  const geoPct = totalMkt > 0 ? ((totalGeo / totalMkt) * 100).toFixed(1) + '%' : '0%';

  const resetAll = () => {
    setSelCircle([]); setSelDistrict([]); setSelSection([]);
    setSelMarketPopGroup([]); setSelL3m([]); setSelGeo([]); setOpenId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketRows();
    setRefreshing(false);
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: '#f4f7fb', color: 'var(--color-text-primary)'
    }}>

      {/* HEADER */}
      <div style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '12px 16px', flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: '#e8f1ff',
              border: '0.5px solid #cfe0ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <BarChart3 size={18} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>WD MDP</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>Market Development Program</div>
              <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 500, marginTop: 1 }}>Enduring Value</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[Search, Bell, User].map((Icon, i) => (
              <button key={i} style={{
                width: 32, height: 32, borderRadius: 8,
                border: '0.5px solid var(--color-border-tertiary)',
                background: 'var(--color-background-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <Icon size={15} color="var(--color-text-secondary)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>

        {/* FILTERS */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 12, padding: 10, paddingBottom: 42, marginBottom: 10,
          position: 'relative'
        }}>
          <button onClick={resetAll} style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            height: 26,
            borderRadius: 7,
            border: '0.5px solid #cfe0ff',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            cursor: 'pointer',
            padding: '0 8px',
            fontSize: 10,
            fontWeight: 500,
            color: '#2563eb'
          }}>
            <RotateCcw size={11} /> Reset
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
            <Dropdown id="circle" label="Circle name"
              options={availCircles} selected={selCircle}
              onToggle={v => { setSelCircle(p => toggle(p, v)); setSelDistrict([]); setSelSection([]); }}
              openId={openId} setOpenId={setOpenId} />
            <Dropdown id="district" label="District"
              options={availDistricts} selected={selDistrict}
              onToggle={v => { setSelDistrict(p => toggle(p, v)); setSelSection([]); }}
              openId={openId} setOpenId={setOpenId} />
            <Dropdown id="section" label="Section name"
              options={availSections} selected={selSection}
              onToggle={v => setSelSection(p => toggle(p, v))}
              openId={openId} setOpenId={setOpenId} />
            <Dropdown id="l3m" label="L3M Coverage"
              options={L3M_OPTS} selected={selL3m}
              onToggle={v => setSelL3m(p => toggle(p, v))}
              openId={openId} setOpenId={setOpenId} />
            <Dropdown id="geo" label="Geo Q4 25-26"
              options={GEO_OPTS} selected={selGeo}
              onToggle={v => setSelGeo(p => toggle(p, v))}
              openId={openId} setOpenId={setOpenId} />
            <Dropdown id="market-pop-group" label="MARKET_POP_GROUP"
              options={availMarketPopGroups} selected={selMarketPopGroup}
              onToggle={v => setSelMarketPopGroup(p => toggle(p, v))}
              openId={openId} setOpenId={setOpenId} />
          </div>

          {fetchError && (
            <div style={{
              marginTop: 8,
              borderRadius: 8,
              border: '0.5px solid #fecaca',
              background: '#fef2f2',
              color: '#b91c1c',
              padding: '7px 9px',
              fontSize: 11,
              lineHeight: 1.35
            }}>
              Unable to fetch data from Supabase. {fetchError}
            </div>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10, alignItems: 'stretch' }}>
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 10, padding: 10,
            minHeight: 108,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
              L3M Coverage (1/0) May '26 / Distinct Market ID
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#2563eb', lineHeight: 1, marginTop: 'auto' }}>
              {l3mPct}
            </div>
            <div style={{
              marginTop: 6, paddingTop: 6,
              borderTop: '0.5px solid var(--color-border-tertiary)',
              fontSize: 10, color: 'var(--color-text-secondary)'
            }}>
              {totalL3m.toLocaleString()} / {totalMkt.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 10, padding: 10,
            minHeight: 108,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
              Geo Q4 25–26 / Distinct Market ID
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#2563eb', lineHeight: 1, marginTop: 'auto' }}>
              {geoPct}
            </div>
            <div style={{
              marginTop: 6, paddingTop: 6,
              borderTop: '0.5px solid var(--color-border-tertiary)',
              fontSize: 10, color: 'var(--color-text-secondary)'
            }}>
              {totalGeo.toLocaleString()} / {totalMkt.toLocaleString()}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 12, overflow: 'hidden'
        }}>
          <div style={{
            padding: '10px 14px',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Circle Level Score Summary</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {summarized.length} Records
              </div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                fontSize: 11, color: '#2563eb', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer', border: 'none', background: 'transparent'
              }}
            >
              <RotateCcw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as any}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520, tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--color-background-secondary)' }}>
                  {[
                    { label: 'Circle name', w: 85 },
                    { label: 'District', w: 80 },
                    { label: 'Section', w: 65 },
                    { label: 'Market ID\n(distinct)', w: 75 },
                    { label: "L3M\nMay '26", w: 70 },
                    { label: 'Geo Q4\n25–26', w: 70 },
                  ].map(({ label, w }) => (
                    <th key={label} style={{
                      fontSize: 10, fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                      padding: '9px 8px', textAlign: 'left',
                      borderBottom: '0.5px solid var(--color-border-tertiary)',
                      width: w, whiteSpace: 'pre-line', lineHeight: 1.3
                    }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '12px 8px',
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          textAlign: 'center'
                        }}
                      >
                        Loading Market data...
                      </td>
                    </tr>
                  )
                  : summarized.length === 0
                  ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '12px 8px',
                          fontSize: 12,
                          color: 'var(--color-text-secondary)',
                          textAlign: 'center'
                        }}
                      >
                        {rows.length === 0 ? 'No Market rows available' : 'No records match selected filters'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {summarized.map((r: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.circle}</td>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.district}</td>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.section}</td>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.marketId.toLocaleString()}</td>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.l3m.toLocaleString()}</td>
                          <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.geo.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr style={{ background: 'var(--color-background-secondary)' }}>
                        <td colSpan={3} style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>Grand Total</td>
                        <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalMkt.toLocaleString()}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalL3m.toLocaleString()}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalGeo.toLocaleString()}</td>
                      </tr>
                    </>
                  )
                }
              </tbody>
            </table>
          </div>

          <div style={{
            padding: '7px 14px',
            background: 'var(--color-background-secondary)',
            borderTop: '0.5px solid var(--color-border-tertiary)',
            display: 'flex', justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Swipe to view more</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Last updated: 25 May 2026</span>
          </div>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}