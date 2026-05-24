import { useEffect, useMemo, useState } from 'react';
import { Search, Bell, User, ChevronDown, RotateCcw, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Header Component
function Header() {
  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">ITC</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-foreground leading-tight">WD MDP</h1>
            <p className="text-xs text-muted-foreground leading-tight">Market Development Program</p>
            <p className="text-[10px] text-muted-foreground/70 leading-tight">Enduring Value</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </header>
  );
}

// Dashboard Toggle Component
interface DashboardToggleProps {
  active: 'circle' | 'section';
  onChange: (value: 'circle' | 'section') => void;
}

function DashboardToggle({ active, onChange }: DashboardToggleProps) {
  return (
    <div className="bg-muted rounded-lg p-1 flex gap-1">
      <button
        onClick={() => onChange('circle')}
        className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          active === 'circle'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Circle Level Score Summary
      </button>
      <button
        onClick={() => onChange('section')}
        className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
          active === 'section'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Section Level Score Summary
      </button>
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  filters: {
    circle_new: string[];
    state: string[];
    category: string[];
    agendas: string[];
    section_new: string[];
  };
  setFilters: (filters: any) => void;
  activeDashboard: 'circle' | 'section';
}

type FilterOptions = {
  circle_new: string[];
  state: string[];
  category: string[];
  agendas: string[];
  section_new: string[];
};

const defaultFilterOptions: FilterOptions = {
  circle_new: [],
  state: [],
  category: [],
  agendas: [],
  section_new: [],
};

const uniqueSortedValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

function FilterSection({ filters, setFilters, activeDashboard }: FilterSectionProps) {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);

  useEffect(() => {
    let active = true;

    const loadFilterOptions = async () => {
      const { data, error } = await supabase.from('Rise').select('*');

      if (!active) return;

      if (error) {
        console.error('Failed to fetch Rise filter options:', error);
        return;
      }

      const rows = (data ?? []) as RiseRow[];

      setFilterOptions({
        circle_new: uniqueSortedValues(rows.map((row) => toText(pickValue(row, ['Circle New', 'circle_new', 'circleNew', 'circle'])))),
        state: uniqueSortedValues(rows.map((row) => toText(pickValue(row, ['State', 'state'])))),
        category: uniqueSortedValues(rows.map((row) => toText(pickValue(row, ['Cat', 'cat', 'category'])))),
        agendas: uniqueSortedValues(rows.map((row) => toText(pickValue(row, ['Agendas', 'agenda', 'agendas', 'Agenda'])))),
        section_new: uniqueSortedValues(rows.map((row) => toText(pickValue(row, ['Section New', 'section_new', 'sectionNew', 'section'])))),
      });
    };

    loadFilterOptions();

    return () => {
      active = false;
    };
  }, []);

  const resetFilters = () => {
    setFilters({
      circle_new: [],
      state: [],
      category: [],
      agendas: [],
      section_new: []
    });
  };

  const toggleFilter = (filterKey: string, value: string) => {
    setFilters({
      ...filters,
      [filterKey]: filters[filterKey as keyof typeof filters].includes(value)
        ? filters[filterKey as keyof typeof filters].filter((v: string) => v !== value)
        : [...filters[filterKey as keyof typeof filters], value]
    });
  };

  const FilterChip = ({ label, filterKey }: { label: string; filterKey: string }) => {
    const selectedCount = filters[filterKey as keyof typeof filters].length;
    const isOpen = openFilter === filterKey;

    return (
      <div className="relative">
        <button
          onClick={() => setOpenFilter(isOpen ? null : filterKey)}
          className="px-3 py-1.5 bg-card border border-border rounded-lg flex items-center gap-2 text-xs hover:bg-muted transition-colors"
        >
          <span className="text-foreground">{label}</span>
          {selectedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-medium">
              {selectedCount}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpenFilter(null)}
            />
            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-20 min-w-[200px] max-h-[280px] overflow-y-auto">
              <div className="p-2">
                {filterOptions[filterKey as keyof typeof filterOptions].map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 px-2 py-2 hover:bg-muted rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters[filterKey as keyof typeof filters].includes(option)}
                      onChange={() => toggleFilter(filterKey, option)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-xs text-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">
        {activeDashboard === 'circle' && (
          <FilterChip label="Circle_New" filterKey="circle_new" />
        )}
        <FilterChip label="State" filterKey="state" />
        <FilterChip label="Category" filterKey="category" />
        <FilterChip label="Agendas" filterKey="agendas" />
        {activeDashboard === 'section' && (
          <FilterChip label="Section New" filterKey="section_new" />
        )}

        <button
          onClick={resetFilters}
          className="ml-auto px-3 py-1.5 bg-muted text-muted-foreground rounded-lg flex items-center gap-1.5 text-xs hover:bg-muted/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>
    </div>
  );
}

// Data Table Component
interface DataTableProps {
  type: 'circle' | 'section';
  filters: any;
}

type RiseRow = Record<string, unknown>;

type SummaryRow = {
  label: string;
  weithage: number;
  score: number;
  scorePercent: number;
  rank: number | null;
  isGrandTotal?: boolean;
};

const toText = (value: unknown) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const pickValue = (row: RiseRow, keys: string[]) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
};

const groupRiseRows = (
  rows: RiseRow[],
  groupKeys: string[],
): SummaryRow[] => {
  const grouped = new Map<string, { label: string; weithage: number; score: number }>();

  for (const row of rows) {
    const label = toText(pickValue(row, groupKeys));
    if (!label || label.toLowerCase() === 'grand total') continue;

    const current = grouped.get(label) ?? { label, weithage: 0, score: 0 };
    current.weithage += toNumber(pickValue(row, ['Weithage', 'weithage', 'weightage']));
    current.score += toNumber(pickValue(row, ['Score', 'score']));
    grouped.set(label, current);
  }

  return Array.from(grouped.values())
    .map((row) => ({
      ...row,
      scorePercent: row.weithage > 0 ? (row.score / row.weithage) * 100 : 0,
      rank: 0,
    }))
    .sort((a, b) => b.scorePercent - a.scorePercent)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
};

const buildGrandTotalRow = (rows: SummaryRow[]): SummaryRow => {
  const weithage = rows.reduce((total, row) => total + row.weithage, 0);
  const score = rows.reduce((total, row) => total + row.score, 0);

  return {
    label: 'Grand Total',
    weithage,
    score,
    scorePercent: weithage > 0 ? (score / weithage) * 100 : 0,
    rank: null,
    isGrandTotal: true,
  };
};

function DataTable({ type, filters }: DataTableProps) {
  const [rows, setRows] = useState<RiseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRows = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('Rise').select('*');

      if (!active) return;

      if (error) {
        console.error('Failed to fetch Rise data for sales dashboard:', error);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as RiseRow[]);
      setLoading(false);
    };

    loadRows();

    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(() => {
    const filteredRows = rows.filter((row) => {
      const circleValue = toText(pickValue(row, ['Circle New', 'circle_new', 'circleNew', 'circle']));
      const stateValue = toText(pickValue(row, ['State', 'state']));
      const categoryValue = toText(pickValue(row, ['Cat', 'cat', 'category']));
      const agendaValue = toText(pickValue(row, ['Agendas', 'agenda', 'agendas', 'Agenda']));
      const sectionValue = toText(pickValue(row, ['Section New', 'section_new', 'sectionNew', 'section']));
      const isGrandTotalRow =
        circleValue.toLowerCase() === 'grand total' ||
        stateValue.toLowerCase() === 'grand total' ||
        categoryValue.toLowerCase() === 'grand total' ||
        agendaValue.toLowerCase() === 'grand total' ||
        sectionValue.toLowerCase() === 'grand total';

      if (isGrandTotalRow) return false;

      if (filters.circle_new.length > 0 && !filters.circle_new.includes(circleValue)) return false;
      if (filters.state.length > 0 && !filters.state.includes(stateValue)) return false;
      if (filters.category.length > 0 && !filters.category.includes(categoryValue)) return false;
      if (filters.agendas.length > 0 && !filters.agendas.includes(agendaValue)) return false;
      if (type === 'section' && filters.section_new.length > 0 && !filters.section_new.includes(sectionValue)) return false;

      return true;
    });

    if (type === 'circle') {
      const groupedRows = groupRiseRows(filteredRows, ['Circle New', 'circle_new', 'circleNew', 'circle']);
      return [...groupedRows, buildGrandTotalRow(groupedRows)];
    }

    const groupedRows = groupRiseRows(filteredRows, ['Section New', 'section_new', 'sectionNew', 'section']);
    return [...groupedRows, buildGrandTotalRow(groupedRows)];
  }, [filters, rows, type]);

  const now = new Date();
  const timestamp = `${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  const summaryRows = data.filter((row) => !row.isGrandTotal);
  const grandTotalRow = data.find((row) => row.isGrandTotal) ?? null;

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{data.length}</span> records
          </p>
          <p className="text-xs text-muted-foreground">
            Updated: {timestamp}
          </p>
        </div>
        <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-24">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading Rise data...
          </div>
        ) : (
        <div className="min-w-full pb-4">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground border-b border-border">
                  Row Labels
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                  Weithage
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground border-b border-border">
                  Score
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                  Score%
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground border-b border-border">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-foreground">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                      {Math.ceil(row.weithage)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                      {row.score.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                    {row.scorePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-right">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      row.rank === 1 ? 'bg-primary/10 text-primary' :
                      row.rank === 2 ? 'bg-accent text-accent-foreground' :
                      row.rank === 3 ? 'bg-secondary text-secondary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {row.rank}
                    </span>
                  </td>
                </tr>
              ))}

              {grandTotalRow && (
                <tr className="bg-primary/5 border-t-2 border-primary/20 font-semibold">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {grandTotalRow.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                    {Math.ceil(grandTotalRow.weithage)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                    {grandTotalRow.score.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right">
                    {grandTotalRow.scorePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Swipe to view more columns</span>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [activeDashboard, setActiveDashboard] = useState<'circle' | 'section'>('circle');
  const [filters, setFilters] = useState({
    circle_new: [],
    state: [],
    category: [],
    agendas: [],
    section_new: []
  });

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header />

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 py-3 bg-card border-b border-border">
          <DashboardToggle
            active={activeDashboard}
            onChange={setActiveDashboard}
          />
        </div>

        <FilterSection filters={filters} setFilters={setFilters} activeDashboard={activeDashboard} />

        <div className="flex-1 min-h-0 overflow-hidden">
          <DataTable
            type={activeDashboard}
            filters={filters}
          />
        </div>
      </div>

    
    </div>
  );
}