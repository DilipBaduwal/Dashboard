import { useEffect, useRef, useState } from 'react';
import { BarChart3, Bell, User, Search, ChevronDown, RotateCcw, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type SourceRow = Record<string, unknown>;

type ProductivityRow = {
  circle: string;
  section: string;
  destination: string;
  dsType: string;
  wdDestinationCode: string;
  p1FlagValue: string;
  p1FlagCount: number;
  daysOrders: number;
  hhUsage: number;
  uob: number;
  ulc: number;
  baAch: number;
  incentiveAch: number;
};

type SummaryRow = {
  circle: string;
  section: string;
  dsCount: number;
  p1Flag: number;
  daysOrders: number;
  hhUsage: number;
  uob: number;
  ulc: number;
  baAch: number;
  incentiveAch: number;
};

const SUPABASE_PAGE_SIZE = 1000;
const PRODUCTIVITY_TABLE = 'ds_productivity';

function normalizeKeyName(key: string) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pickValue(row: SourceRow, keys: string[]) {
  const normalizedRowEntries = Object.entries(row).map(([k, v]) => [normalizeKeyName(k), v] as const);

  for (const key of keys) {
    const exactValue = row[key];
    if (exactValue !== null && exactValue !== undefined && String(exactValue).trim() !== '') {
      return exactValue;
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

function toFlagCount(value: unknown) {
  const text = toText(value).toLowerCase();
  if (!text) return 0;
  if (['1', 'true', 'yes', 'y'].includes(text)) return 1;
  return toNumber(text) > 0 ? 1 : 0;
}

function toPercent(value: number) {
  return value.toFixed(1) + '%';
}

function normalizeProductivityRow(row: SourceRow): ProductivityRow {
  const circle = toText(pickValue(row, ['Circle', 'Circle Name', 'circle', 'circle_name']));
  const section = toText(pickValue(row, ['Section', 'Section Name', 'section', 'section_name']));
  const destination = toText(pickValue(row, ['Destination', 'Destination Name', 'destination', 'destination_name']));
  const dsType = toText(pickValue(row, ['DS Type', 'DSType', 'ds_type', 'dstype']));
  const wdDestinationCode = toText(pickValue(row, ['WD Destination Code', 'WD_Destination_Code', 'WD Destination', 'Destination Code', 'destination_code']));
  const p1FlagRaw = pickValue(row, ['P1 Flag', 'P1_Flag', 'P1', 'p1_flag']);

  return {
    circle,
    section,
    destination,
    dsType,
    wdDestinationCode,
    p1FlagValue: toFlagCount(p1FlagRaw) > 0 ? '1' : '0',
    p1FlagCount: toFlagCount(p1FlagRaw),
    daysOrders: toNumber(pickValue(row, ['Days (Orders)', 'Days Orders', 'days_orders', 'days_order', 'days'])),
    hhUsage: toNumber(pickValue(row, ['HH Usage', 'HH_Usage', 'hh_usage'])),
    uob: toNumber(pickValue(row, ['UOB', 'uob'])),
    ulc: toNumber(pickValue(row, ['ULC', 'ulc'])),
    baAch: toNumber(pickValue(row, ['BA Ach', 'BA_Ach', 'ba_ach'])),
    incentiveAch: toNumber(pickValue(row, ['Incentive Ach%', 'Incentive Ach', 'Incentive_Ach', 'incentive_ach'])),
  };
}

function avail(rows: ProductivityRow[], field: keyof ProductivityRow, filters: Record<string, string[]>) {
  let base = rows;
  if (filters.circle?.length) base = base.filter((r) => filters.circle.includes(r.circle));
  if (filters.section?.length) base = base.filter((r) => filters.section.includes(r.section));
  if (filters.destination?.length) base = base.filter((r) => filters.destination.includes(r.destination));
  if (filters.dsType?.length) base = base.filter((r) => filters.dsType.includes(r.dsType));
  if (filters.p1Flag?.length) base = base.filter((r) => filters.p1Flag.includes(r.p1FlagValue));
  return [...new Set(base.map((r) => String(r[field] ?? '')))].filter(Boolean).sort();
}

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
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
      const width = Math.max(rect.width, 150);
      const left = Math.min(rect.left, window.innerWidth - width - 8);
      setPos({ top: dropUp ? rect.top - 4 : rect.bottom + 4, left, width, dropUp });
    }
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpenId(isOpen ? null : id);
        }}
        style={{
          width: '100%',
          height: 36,
          borderRadius: 8,
          border: '0.5px solid var(--color-border-tertiary)',
          background: 'var(--color-background-primary)',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          gap: 4,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
          {selected.length ? <span style={{ color: '#2563eb' }}>{selected.length} selected</span> : label}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0 }} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
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
            backdropFilter: 'none',
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '9px 12px', fontSize: 12, color: 'var(--color-text-secondary)' }}>No options</div>
          ) : (
            options.map((v) => (
              <div
                key={v}
                onClick={() => onToggle(v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  background: selected.includes(v) ? '#eff6ff' : '#ffffff',
                  borderBottom: '0.5px solid rgba(203, 213, 225, 0.6)',
                }}
              >
                <span>{v}</span>
                {selected.includes(v) && <Check size={13} color="#2563eb" />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function DistributionDashboardPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows, setRows] = useState<ProductivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selCircle, setSelCircle] = useState<string[]>([]);
  const [selSection, setSelSection] = useState<string[]>([]);
  const [selDestination, setSelDestination] = useState<string[]>([]);
  const [selDsType, setSelDsType] = useState<string[]>([]);
  const [selP1Flag, setSelP1Flag] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<keyof SummaryRow | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const loadRows = async () => {
    setLoading(true);
    setFetchError(null);

    const tableRows: SourceRow[] = [];
    let from = 0;

    while (true) {
      const to = from + SUPABASE_PAGE_SIZE - 1;
      const { data, error } = await supabase.from(PRODUCTIVITY_TABLE).select('*').range(from, to);

      if (error) {
        setRows([]);
        setFetchError(`Table ${PRODUCTIVITY_TABLE}: ${error.message}`);
        setLoading(false);
        return;
      }

      const page = (data ?? []) as SourceRow[];
      tableRows.push(...page);

      if (page.length < SUPABASE_PAGE_SIZE) {
        break;
      }

      from += SUPABASE_PAGE_SIZE;
    }

    setRows(tableRows.map(normalizeProductivityRow));
    setLoading(false);
  };

  useEffect(() => {
    void loadRows();
  }, []);

  useEffect(() => {
    const close = () => setOpenId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const availCircles = avail(rows, 'circle', {});
  const availSections = avail(rows, 'section', { circle: selCircle });
  const availDestinations = avail(rows, 'wdDestinationCode', { circle: selCircle, section: selSection });
  const availDsTypes = avail(rows, 'dsType', {
    circle: selCircle,
    section: selSection,
    destination: selDestination,
  });
  const availP1Flags = avail(rows, 'p1FlagValue', {
    circle: selCircle,
    section: selSection,
    destination: selDestination,
    dsType: selDsType,
  });

  const filtered = rows.filter((r) => {
    if (selCircle.length && !selCircle.includes(r.circle)) return false;
    if (selSection.length && !selSection.includes(r.section)) return false;
    if (selDestination.length && !selDestination.includes(r.wdDestinationCode)) return false;
    if (selDsType.length && !selDsType.includes(r.dsType)) return false;
    if (selP1Flag.length && !selP1Flag.includes(r.p1FlagValue)) return false;
    return true;
  });

  const summarized = (() => {
    const grouped = new Map<
      string,
      {
        circle: string;
        section: string;
        dsCount: number;
        p1Flag: number;
        daysOrdersSum: number;
        daysOrdersCount: number;
        hhUsageSum: number;
        hhUsageCount: number;
        uobSum: number;
        uobCount: number;
        ulcSum: number;
        ulcCount: number;
        baAchSum: number;
        baAchCount: number;
        incentiveAchSum: number;
        incentiveAchCount: number;
      }
    >();

    for (const r of filtered) {
      const key = `${r.circle}||${r.section}`;
      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          circle: r.circle,
          section: r.section,
          dsCount: 1,
          p1Flag: r.p1FlagCount,
          daysOrdersSum: r.daysOrders,
          daysOrdersCount: 1,
          hhUsageSum: r.hhUsage,
          hhUsageCount: 1,
          uobSum: r.uob,
          uobCount: 1,
          ulcSum: r.ulc,
          ulcCount: 1,
          baAchSum: r.baAch,
          baAchCount: 1,
          incentiveAchSum: r.incentiveAch,
          incentiveAchCount: 1,
        });
        continue;
      }

      existing.dsCount += 1;
      existing.p1Flag += r.p1FlagCount;
      existing.daysOrdersSum += r.daysOrders;
      existing.daysOrdersCount += 1;
      existing.hhUsageSum += r.hhUsage;
      existing.hhUsageCount += 1;
      existing.uobSum += r.uob;
      existing.uobCount += 1;
      existing.ulcSum += r.ulc;
      existing.ulcCount += 1;
      existing.baAchSum += r.baAch;
      existing.baAchCount += 1;
      existing.incentiveAchSum += r.incentiveAch;
      existing.incentiveAchCount += 1;
    }

    return Array.from(grouped.values()).map<SummaryRow>((g) => ({
      circle: g.circle,
      section: g.section,
      dsCount: g.dsCount,
      p1Flag: g.p1Flag,
      daysOrders: g.daysOrdersCount ? g.daysOrdersSum / g.daysOrdersCount : 0,
      hhUsage: g.hhUsageCount ? g.hhUsageSum / g.hhUsageCount : 0,
      uob: g.uobCount ? g.uobSum / g.uobCount : 0,
      ulc: g.ulcCount ? g.ulcSum / g.ulcCount : 0,
      baAch: g.baAchCount ? (g.baAchSum / g.baAchCount) * 100 : 0,
      incentiveAch: g.incentiveAchCount ? (g.incentiveAchSum / g.incentiveAchCount) * 100 : 0,
    }));
  })();
  const sortedSummarized = (() => {
    if (!sortBy) return summarized;
    const copy = [...summarized];
    copy.sort((a, b) => {
      const va = a[sortBy];
      const vb = b[sortBy];

      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }

      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      if (sa === sb) return 0;
      return sortDir === 'asc' ? (sa < sb ? -1 : 1) : (sa < sb ? 1 : -1);
    });
    return copy;
  })();
  const totalDsCount = filtered.length;
  const totalP1Flag = filtered.reduce((sum, r) => sum + r.p1FlagCount, 0);
  const totalDaysOrders = filtered.length ? filtered.reduce((sum, r) => sum + r.daysOrders, 0) / filtered.length : 0;
  const totalHHUsage = filtered.length ? filtered.reduce((sum, r) => sum + r.hhUsage, 0) / filtered.length : 0;
  const totalUob = filtered.length ? filtered.reduce((sum, r) => sum + r.uob, 0) / filtered.length : 0;
  const totalUlc = filtered.length ? filtered.reduce((sum, r) => sum + r.ulc, 0) / filtered.length : 0;
  const totalBaAch = filtered.length ? (filtered.reduce((sum, r) => sum + r.baAch, 0) / filtered.length) * 100 : 0;
  const totalIncentiveAch = filtered.length ? (filtered.reduce((sum, r) => sum + r.incentiveAch, 0) / filtered.length) * 100 : 0;

  const resetAll = () => {
    setSelCircle([]);
    setSelSection([]);
    setSelDestination([]);
    setSelDsType([]);
    setSelP1Flag([]);
    setOpenId(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRows();
    setRefreshing(false);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f4f7fb',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          background: 'var(--color-background-primary)',
          borderBottom: '0.5px solid var(--color-border-tertiary)',
          padding: '12px 16px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#e8f1ff',
                border: '0.5px solid #cfe0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <BarChart3 size={18} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.2 }}>WD MDP</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 1 }}>Distribution Productivity</div>
              <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 500, marginTop: 1 }}>Enduring Value</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[Search, Bell, User].map((Icon, i) => (
              <button
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: '0.5px solid var(--color-border-tertiary)',
                  background: 'var(--color-background-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Icon size={15} color="var(--color-text-secondary)" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px 24px' }}>
        <div
          style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12,
            padding: 10,
            paddingBottom: 42,
            marginBottom: 10,
            position: 'relative',
          }}
        >
          <button
            onClick={resetAll}
            style={{
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
              color: '#2563eb',
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
            <Dropdown
              id="circle"
              label="Circle"
              options={availCircles}
              selected={selCircle}
              onToggle={(v) => setSelCircle((p) => toggle(p, v))}
              openId={openId}
              setOpenId={setOpenId}
            />
            <Dropdown
              id="section"
              label="Section"
              options={availSections}
              selected={selSection}
              onToggle={(v) => setSelSection((p) => toggle(p, v))}
              openId={openId}
              setOpenId={setOpenId}
            />
            <Dropdown
              id="destination"
              label="Destination"
              options={availDestinations}
              selected={selDestination}
              onToggle={(v) => setSelDestination((p) => toggle(p, v))}
              openId={openId}
              setOpenId={setOpenId}
            />
            <Dropdown
              id="ds-type"
              label="DS Type"
              options={availDsTypes}
              selected={selDsType}
              onToggle={(v) => setSelDsType((p) => toggle(p, v))}
              openId={openId}
              setOpenId={setOpenId}
            />
            <Dropdown
              id="p1-flag"
              label="P1 Flag"
              options={availP1Flags}
              selected={selP1Flag}
              onToggle={(v) => setSelP1Flag((p) => toggle(p, v))}
              openId={openId}
              setOpenId={setOpenId}
            />
            <div aria-hidden="true" style={{ visibility: 'hidden' }} />
          </div>

          {fetchError && (
            <div
              style={{
                marginTop: 8,
                borderRadius: 8,
                border: '0.5px solid #fecaca',
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '7px 9px',
                fontSize: 11,
                lineHeight: 1.35,
              }}
            >
              Unable to fetch data from Supabase. {fetchError}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10, alignItems: 'stretch' }}>
          <div
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 10,
              padding: 10,
              minHeight: 108,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
              BA Ach
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#2563eb', lineHeight: 1, marginTop: 'auto' }}>
              {toPercent(totalBaAch)}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 10,
              padding: 10,
              minHeight: 108,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
              Incentive Ach%
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#2563eb', lineHeight: 1, marginTop: 'auto' }}>
              {toPercent(totalIncentiveAch)}
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: 10,
              padding: 10,
              minHeight: 108,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 9, color: 'var(--color-text-secondary)', lineHeight: 1.4, marginBottom: 6 }}>
              P1 Flag Count
            </div>
            <div style={{ fontSize: 22, fontWeight: 500, color: '#2563eb', lineHeight: 1, marginTop: 'auto' }}>
              {totalP1Flag.toLocaleString()}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '0.5px solid var(--color-border-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>DS Productivity Summary</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{sortedSummarized.length} Records</div>
            </div>
            <button
              onClick={handleRefresh}
              style={{
                fontSize: 11,
                color: '#2563eb',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
              }}
            >
              <RotateCcw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' } as any}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980, tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: 'var(--color-background-secondary)' }}>
                  {[
                    { key: 'circle', label: 'Circle', w: 90 },
                    { key: 'section', label: 'Section', w: 90 },
                    { key: 'dsCount', label: 'Ds Count', w: 74 },
                    { key: 'p1Flag', label: 'P1 Flag', w: 74 },
                    { key: 'daysOrders', label: 'Days (Orders)', w: 86 },
                    { key: 'hhUsage', label: 'HH Usage', w: 74 },
                    { key: 'uob', label: 'UOB', w: 62 },
                    { key: 'ulc', label: 'ULC', w: 62 },
                    { key: 'baAch', label: 'BA Ach', w: 72 },
                    { key: 'incentiveAch', label: 'Incentive Ach%', w: 92 },
                  ].map(({ key, label, w }) => (
                    <th
                      key={String(key)}
                      onClick={() => {
                        const k = key as keyof SummaryRow;
                        if (sortBy === k) {
                          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortBy(k);
                          setSortDir('asc');
                        }
                      }}
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: 'var(--color-text-secondary)',
                        padding: '9px 8px',
                        textAlign: 'left',
                        borderBottom: '0.5px solid var(--color-border-tertiary)',
                        width: w,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        <span>{label}</span>
                        {sortBy === key && <span style={{ fontSize: 11 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ padding: '12px 8px', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}
                    >
                      Loading ds_productivity data...
                    </td>
                  </tr>
                ) : summarized.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ padding: '12px 8px', fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}
                    >
                      {rows.length === 0 ? 'No ds_productivity rows available' : 'No records match selected filters'}
                    </td>
                  </tr>
                ) : (
                  <>
                    {sortedSummarized.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.circle}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.section}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.dsCount.toLocaleString()}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.p1Flag.toLocaleString()}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.daysOrders.toFixed(1)}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.hhUsage.toFixed(1)}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.uob.toFixed(1)}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{r.ulc.toFixed(1)}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{toPercent(r.baAch)}</td>
                        <td style={{ fontSize: 11, padding: '8px 8px' }}>{toPercent(r.incentiveAch)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: 'var(--color-background-secondary)' }}>
                      <td colSpan={2} style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>Grand Total</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalDsCount.toLocaleString()}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalP1Flag.toLocaleString()}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalDaysOrders.toFixed(1)}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalHHUsage.toFixed(1)}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalUob.toFixed(1)}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{totalUlc.toFixed(1)}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{toPercent(totalBaAch)}</td>
                      <td style={{ fontSize: 11, padding: '8px 8px', fontWeight: 500 }}>{toPercent(totalIncentiveAch)}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: '7px 14px',
              background: 'var(--color-background-secondary)',
              borderTop: '0.5px solid var(--color-border-tertiary)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Swipe to view more</span>
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>Last updated: 26 May 2026</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
