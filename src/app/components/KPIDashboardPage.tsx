import { useEffect, useMemo, useState } from "react";
import { Download, Search, Bell, Menu } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AndroidFilters } from "./AndroidFilters";
import { EnterpriseDataGrid } from "./EnterpriseDataGrid";

interface KpiRow {
  id: string;
  circleNew: string;
  sectionNew: string;
  agendas: string;
  state: string;
  cat: string;
  weithage: string | number;
  tgt: string | number;
  ach: string | number;
  achPct: string | number;
  score: string | number;
}

const rowText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const pickValue = (
  row: Record<string, unknown>,
  keys: string[],
): string | number => {
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined) {
      if (typeof value === "string") {
        if (value.trim() !== "") {
          return value;
        }
      } else if (typeof value === "number") {
        return value;
      } else if (String(value).trim() !== "") {
        return String(value);
      }
    }
  }

  return "";
};

const toKpiRow = (row: Record<string, unknown>, index: number): KpiRow => ({
  id: rowText(pickValue(row, ["id", "ID"])) || `row-${index + 1}`,
  circleNew: rowText(
    pickValue(row, ["Circle New", "circle_new", "circleNew", "circle"]),
  ),
  sectionNew: rowText(
    pickValue(row, ["Section New", "section_new", "sectionNew", "section"]),
  ),
  agendas: rowText(
    pickValue(row, ["Agendas", "agenda", "agendas", "Agenda"]),
  ),
  state: rowText(pickValue(row, ["State", "state"])),
  cat: rowText(pickValue(row, ["Cat", "cat", "category"])),
  weithage: pickValue(row, ["Weithage", "weithage", "weightage"]),
  tgt: pickValue(row, ["Tgt", "tgt", "target"]),
  ach: pickValue(row, ["Ach", "ach"]),
  achPct: pickValue(row, ["ACH %", "ACH%", "achPct", "ach_pct"]),
  score: pickValue(row, ["Score", "score"]),
});

export default function App() {
  const [rows, setRows] = useState<KpiRow[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAgendas, setSelectedAgendas] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadRows = async () => {
      setIsLoading(true);

      const queries = ["Rise", "rise"];
      let fetchedRows: Record<string, unknown>[] = [];
      let fetchError: unknown = null;

      for (const tableName of queries) {
        const { data, error } = await supabase.from(tableName).select("*");

        if (!error) {
          fetchedRows = (data ?? []) as Record<string, unknown>[];
          fetchError = null;
          break;
        }

        fetchError = error;
      }

      if (!isActive) return;

      if (fetchError) {
        console.error("Failed to fetch Rise data:", fetchError);
        setRows([]);
        setIsLoading(false);
        return;
      }

      setRows(fetchedRows.map((row, index) => toKpiRow(row, index)));
      setIsLoading(false);
    };

    loadRows();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  const filterOptions = useMemo(() => {
    const uniqueValues = (values: string[]) =>
      Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      );

    return {
      circles: uniqueValues(rows.map((row) => row.circleNew)),
      states: uniqueValues(rows.map((row) => row.state)),
      categories: uniqueValues(rows.map((row) => row.cat)),
      agendas: uniqueValues(rows.map((row) => row.agendas)),
      sections: uniqueValues(rows.map((row) => row.sectionNew)),
    };
  }, [rows]);

  const filteredData = rows.filter((row) => {
    if (
      selectedCircles.length > 0 &&
      !selectedCircles.includes(row.circleNew)
    )
      return false;
    if (
      selectedStates.length > 0 &&
      !selectedStates.includes(row.state)
    )
      return false;
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.includes(row.cat)
    )
      return false;
    if (
      selectedAgendas.length > 0 &&
      !selectedAgendas.includes(row.agendas)
    )
      return false;
    if (
      selectedSections.length > 0 &&
      !selectedSections.includes(row.sectionNew)
    )
      return false;

    if (globalSearch) {
      const searchLower = globalSearch.toLowerCase();
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchLower),
      );
    }

    return true;
  });

  const activeFilterCount =
    selectedCircles.length +
    selectedStates.length +
    selectedCategories.length +
    selectedAgendas.length +
    selectedSections.length;

  const clearAllFilters = () => {
    setSelectedCircles([]);
    setSelectedStates([]);
    setSelectedCategories([]);
    setSelectedAgendas([]);
    setSelectedSections([]);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Circle New",
      "Section New",
      "Agendas",
      "State",
      "Cat",
      "Weithage",
      "Tgt",
      "Ach",
      "ACH %",
      "Score",
    ];
    const csv = [
      headers.join(","),
      ...filteredData.map((row) =>
        [
          row.id,
          row.circleNew,
          row.sectionNew,
          row.agendas,
          row.state,
          row.cat,
          row.weithage,
          row.tgt,
          row.ach,
          row.achPct,
          row.score,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-export.csv";
    a.click();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F5F7FA]">
      <header className="bg-white border-b border-gray-200 shadow-sm z-40 shrink-0">
        <div className="px-3 lg:px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 bg-[#D32F2F] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    ITC
                  </span>
                </div>
                <div>
                  <h1 className="text-base lg:text-lg font-bold text-gray-900 leading-tight">
                    WD MDP
                  </h1>
                  <p className="text-[10px] lg:text-xs text-gray-600 leading-tight">
                    Market Development Program
                  </p>
                  <p className="text-[9px] lg:text-[10px] text-gray-500 italic leading-tight">
                    "Enduring Value"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-2">
              {!isMobile && (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={globalSearch}
                      onChange={(e) =>
                        setGlobalSearch(e.target.value)
                      }
                      className="w-48 lg:w-64 pl-9 pr-3 py-2 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent transition-all text-sm"
                    />
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1976D2] text-white rounded hover:bg-[#1565C0] transition-colors text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </>
              )}
              <button className="p-2 hover:bg-gray-100 rounded transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D32F2F] rounded-full" />
              </button>
              <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                <div className="h-8 w-8 rounded-full bg-[#546E7A] flex items-center justify-center text-white text-sm font-semibold">
                  U
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AndroidFilters
        filters={{
          circles: {
            selected: selectedCircles,
            onChange: setSelectedCircles,
          },
          states: {
            selected: selectedStates,
            onChange: setSelectedStates,
          },
          categories: {
            selected: selectedCategories,
            onChange: setSelectedCategories,
          },
          agendas: {
            selected: selectedAgendas,
            onChange: setSelectedAgendas,
          },
          sections: {
            selected: selectedSections,
            onChange: setSelectedSections,
          },
        }}
        filterOptions={filterOptions}
        onClearAll={clearAllFilters}
        activeFilterCount={activeFilterCount}
      />

      <main className="flex-1 overflow-hidden px-3 lg:px-4 py-3 lg:py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center rounded border border-gray-200 bg-white text-sm text-gray-600">
            Loading data from Supabase...
          </div>
        ) : (
          <EnterpriseDataGrid data={filteredData} isMobile={isMobile} />
        )}
      </main>
    </div>
  );
}