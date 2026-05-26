import { useEffect, useState } from 'react';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  RotateCcw,
  BarChart3,
  Check,
} from 'lucide-react';

const circleData = [
  {
    label: 'Ahmedabad',
    weightage: 10,
    score: 85.5,
    percent: '85.50%',
    rank: 1,
  },
  {
    label: 'Bengaluru',
    weightage: 10,
    score: 78.2,
    percent: '78.20%',
    rank: 2,
  },
  {
    label: 'Chennai',
    weightage: 10,
    score: 72.3,
    percent: '72.30%',
    rank: 3,
  },
];

const sectionData = [
  {
    label: 'Primary Sales',
    weightage: 10,
    score: 88.1,
    percent: '88.10%',
    rank: 1,
  },
  {
    label: 'Distribution',
    weightage: 10,
    score: 76.5,
    percent: '76.50%',
    rank: 2,
  },
  {
    label: 'Retail Excellence',
    weightage: 10,
    score: 66.8,
    percent: '66.80%',
    rank: 3,
  },
];

const branchData = [
  {
    label: 'Patna Branch',
    weightage: 10,
    score: 88.1,
    percent: '88.10%',
    rank: 1,
  },
  {
    label: 'Delhi Branch',
    weightage: 10,
    score: 76.5,
    percent: '76.50%',
    rank: 2,
  },
  {
    label: 'Mumbai Branch',
    weightage: 10,
    score: 66.8,
    percent: '66.80%',
    rank: 3,
  },
];

const filterOptions = {
  circle: ['North', 'South', 'East', 'West'],
  state: ['Bihar', 'Delhi', 'Karnataka', 'Tamil Nadu'],
  category: ['Sales', 'Distribution', 'Visibility'],
};

export default function WdMdpDashboard() {
  const [activeDashboard, setActiveDashboard] = useState('circle');

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    circle: [] as string[],
    state: [] as string[],
    category: [] as string[],
  });

  // CLOSE FILTER WHEN CLICKING OUTSIDE
  useEffect(() => {
    const closeDropdown = () => {
      setOpenFilter(null);
    };

    window.addEventListener('click', closeDropdown);

    return () => {
      window.removeEventListener('click', closeDropdown);
    };
  }, []);

  // TABLE DATA
  const currentData =
    activeDashboard === 'circle'
      ? circleData
      : activeDashboard === 'section'
      ? sectionData
      : branchData;

  // FILTER TOGGLE
  const toggleFilterOption = (type: string, value: string) => {
    setSelectedFilters((prev) => {
      const exists = prev[type as keyof typeof prev].includes(value);

      return {
        ...prev,
        [type]: exists
          ? prev[type as keyof typeof prev].filter((v) => v !== value)
          : [...prev[type as keyof typeof prev], value],
      };
    });
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSelectedFilters({
      circle: [],
      state: [],
      category: [],
    });

    setOpenFilter(null);
  };

  // REFRESH
  const handleRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#16324f] pb-24">
      {/* HEADER */}
      <div className="bg-white border-b border-[#dbe4ee] px-4 pt-10 pb-5 sticky top-0 z-40">
        <div className="flex items-start justify-between">
          {/* LEFT */}
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#e8f1ff] border border-[#cfe0ff] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#2563eb]" />
            </div>

            <div>
              <h1 className="text-[20px] font-bold text-[#173b63]">
                WD MDP
              </h1>

              <p className="text-[12px] text-[#5f7287] font-medium">
                Market Development Program
              </p>

              <p className="text-[11px] text-[#2563eb] font-semibold mt-0.5">
                Enduring Value
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-[#dbe4ee] flex items-center justify-center bg-white">
              <Search className="w-4 h-4 text-[#61778c]" />
            </button>

            <button className="w-9 h-9 rounded-xl border border-[#dbe4ee] flex items-center justify-center bg-white relative">
              <Bell className="w-4 h-4 text-[#61778c]" />

              <div className="absolute top-2 right-2 w-2 h-2 bg-[#2563eb] rounded-full"></div>
            </button>

            <button className="w-9 h-9 rounded-xl border border-[#dbe4ee] flex items-center justify-center bg-white">
              <User className="w-4 h-4 text-[#61778c]" />
            </button>
          </div>
        </div>

        {/* DASHBOARD SWITCH */}
        <div className="mt-5 bg-[#edf3f9] p-1 rounded-2xl flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveDashboard('circle')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl text-[12px] font-semibold transition-all ${
              activeDashboard === 'circle'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#52667a]'
            }`}
          >
            Circle
          </button>

          <button
            onClick={() => setActiveDashboard('section')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl text-[12px] font-semibold transition-all ${
              activeDashboard === 'section'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#52667a]'
            }`}
          >
            Section
          </button>

          <button
            onClick={() => setActiveDashboard('branch')}
            className={`flex-1 min-w-[100px] py-3 rounded-xl text-[12px] font-semibold transition-all ${
              activeDashboard === 'branch'
                ? 'bg-[#2563eb] text-white'
                : 'text-[#52667a]'
            }`}
          >
            Branch
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="px-4 mt-4">
        <div className="bg-white border border-[#dbe4ee] rounded-3xl p-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(filterOptions).map(([key, values]) => (
              <div key={key} className="relative">
                {/* FILTER BUTTON */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenFilter(
                      openFilter === key ? null : key
                    );
                  }}
                  className="w-full h-12 rounded-2xl border border-[#dbe4ee] bg-[#f9fbfd] px-4 flex items-center justify-between"
                >
                  <span className="text-[13px] font-medium text-[#38506a] capitalize">
                    {selectedFilters[key as keyof typeof selectedFilters]
                      .length > 0
                      ? `${selectedFilters[
                          key as keyof typeof selectedFilters
                        ].length} Selected`
                      : key}
                  </span>

                  <ChevronDown className="w-4 h-4 text-[#61778c]" />
                </button>

                {/* DROPDOWN */}
                {openFilter === key && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-14 left-0 w-full bg-white border border-[#dbe4ee] rounded-2xl shadow-xl z-50 p-2"
                  >
                    {values.map((item) => {
                      const selected =
                        selectedFilters[
                          key as keyof typeof selectedFilters
                        ].includes(item);

                      return (
                        <button
                          key={item}
                          onClick={() =>
                            toggleFilterOption(key, item)
                          }
                          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f4f7fb] transition-colors"
                        >
                          <span className="text-[13px] text-[#17324d]">
                            {item}
                          </span>

                          {selected && (
                            <Check className="w-4 h-4 text-[#2563eb]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* RESET BUTTON */}
            <button
              onClick={resetFilters}
              className="h-12 rounded-2xl border border-[#dbe4ee] bg-[#eff6ff] flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[#2563eb]" />

              <span className="text-[13px] font-semibold text-[#2563eb]">
                Reset
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-4 mt-5">
        <div className="bg-white border border-[#dbe4ee] rounded-3xl overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-4 py-4 border-b border-[#edf2f7] flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#173b63]">
                {activeDashboard === 'circle'
                  ? 'Circle Level Score Summary'
                  : activeDashboard === 'section'
                  ? 'Section Level Score Summary'
                  : 'Branch Level Score Summary'}
              </h2>

              <p className="text-[12px] text-[#71859b] mt-1">
                {currentData.length} Records
              </p>
            </div>

            {/* REFRESH BUTTON */}
            <button
              onClick={handleRefresh}
              className="text-[#2563eb] text-[12px] font-semibold flex items-center gap-2"
            >
              <RotateCcw
                className={`w-4 h-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />

              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* TABLE SCROLL */}
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full">
              <thead className="bg-[#f8fafc]">
                <tr className="border-b border-[#e7edf5]">
                  {[
                    'Row Labels',
                    'Weithage',
                    'Score',
                    'Score%',
                    'Rank',
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-left px-4 py-4 text-[12px] font-bold text-[#3b5268]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {currentData.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#edf2f7] hover:bg-[#f8fbff]"
                  >
                    <td className="px-4 py-4 text-[13px] font-medium text-[#17324d]">
                      {item.label}
                    </td>

                    <td className="px-4 py-4 text-[13px] text-[#52667a]">
                      {item.weightage}
                    </td>

                    <td className="px-4 py-4 text-[13px] text-[#52667a]">
                      {item.score}
                    </td>

                    <td className="px-4 py-4 text-[13px] text-[#52667a]">
                      {item.percent}
                    </td>

                    <td className="px-4 py-4">
                      <div className="w-7 h-7 rounded-full bg-[#eff6ff] text-[#2563eb] flex items-center justify-center text-[12px] font-bold">
                        {item.rank}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-3 bg-[#f9fbfd] border-t border-[#edf2f7] flex items-center justify-between">
            <p className="text-[11px] text-[#71859b]">
              Swipe horizontally to view more
            </p>

            <p className="text-[11px] text-[#71859b]">
              Last updated: 25 May 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}