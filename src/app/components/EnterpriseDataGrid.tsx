import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DataRow {
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

interface Column {
  key: keyof DataRow;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
}

interface EnterpriseDataGridProps {
  data: DataRow[];
  isMobile?: boolean;
}

const columns: Column[] = [
  { key: "circleNew", label: "Circle New", width: "140px" },
  { key: "sectionNew", label: "Section New", width: "140px" },
  { key: "agendas", label: "Agendas", width: "130px" },
  { key: "state", label: "State", width: "130px" },
  { key: "cat", label: "Cat", width: "120px" },
  { key: "weithage", label: "Weithage", width: "120px", align: "right" },
  { key: "tgt", label: "Tgt", width: "110px", align: "right" },
  { key: "ach", label: "Ach", width: "110px", align: "right" },
  { key: "achPct", label: "ACH %", width: "110px", align: "right" },
  { key: "score", label: "Score", width: "110px", align: "right" },
];

export function EnterpriseDataGrid({ data, isMobile = false }: EnterpriseDataGridProps) {
  const [sortColumn, setSortColumn] = useState<keyof DataRow | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: keyof DataRow) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const multiplier = sortDirection === "asc" ? 1 : -1;

    const aNum = Number(aVal);
    const bNum = Number(bVal);

    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      return (aNum - bNum) * multiplier;
    }

    return String(aVal).localeCompare(String(bVal)) * multiplier;
  });

  const visibleData = sortedData;

  const getSortIcon = (column: keyof DataRow) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-[#1976D2]" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-[#1976D2]" />
    );
  };

  const formatCellValue = (value: string | number) =>
    typeof value === "number" ? value.toLocaleString() : value;

  const formatAchPctValue = (value: string | number) => {
    const numericValue = typeof value === "number" ? value : Number(value);

    if (Number.isFinite(numericValue)) {
      return `${(numericValue * 100).toFixed(2)}%`;
    }

    return String(value);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-auto overscroll-contain pb-36">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-[#1976D2] text-white">
            <tr className="border-b border-[#1565C0]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 cursor-pointer hover:bg-[#1565C0] transition-colors select-none text-left ${
                    isMobile ? "text-xs" : "text-sm"
                  }`}
                  style={{ width: col.width, textAlign: col.align || "left" }}
                  onClick={() => handleSort(col.key)}
                >
                  <div
                    className={`flex items-center gap-1.5 font-semibold uppercase tracking-wide ${
                      col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : ""
                    }`}
                  >
                    {col.label}
                    {getSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((row, idx) => (
              <tr
                key={row.id}
                className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} text-gray-700`}>
                  {row.circleNew}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} text-gray-700`}>
                  {row.sectionNew}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} text-gray-700`}>
                  {row.agendas}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} text-gray-700`}>
                  {row.state}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} text-gray-700`}>
                  {row.cat}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} font-bold text-gray-900 text-right`}>
                  {formatCellValue(row.weithage)}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} font-bold text-gray-900 text-right`}>
                  {formatCellValue(row.tgt)}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} font-bold text-gray-900 text-right`}>
                  {formatCellValue(row.ach)}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} font-bold text-gray-900 text-right`}>
                  {formatAchPctValue(row.achPct)}
                </td>
                <td className={`px-3 py-2.5 ${isMobile ? "text-xs" : "text-sm"} font-bold text-gray-900 text-right`}>
                  {formatCellValue(row.score)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
