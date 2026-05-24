import { X, ChevronDown, Search, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface AndroidFilterProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

function AndroidFilter({
  label,
  options,
  selectedValues,
  onChange,
}: AndroidFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onChange(filteredOptions);
  };

  const clearAll = () => {
    onChange([]);
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex-1 min-w-[120px]">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded border text-sm font-medium transition-colors
          ${
            selectedValues.length > 0
              ? "bg-[#1976D2] text-white border-[#1565C0]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#1976D2]"
          }
        `}
      >
        <span className="truncate">{label}</span>
        <div className="flex items-center gap-1.5 ml-1 shrink-0">
          {selectedValues.length > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 text-white rounded text-xs font-semibold">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={() => setIsOpen(false)} />
          <div
            ref={dropdownRef}
            className="absolute top-full mt-1 w-80 bg-white rounded border border-gray-300 shadow-lg z-[9999] overflow-hidden"
          >
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={selectAll}
                  className="text-[#1976D2] hover:text-[#1565C0] font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="text-gray-600 hover:text-gray-800 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleValue(option)}
                    className={`
                      w-full text-left px-3 py-2 transition-colors flex items-center gap-2.5 text-sm
                      ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                    `}
                  >
                    <div
                      className={`
                        h-4 w-4 rounded border flex items-center justify-center shrink-0
                        ${
                          isSelected
                            ? "bg-[#1976D2] border-[#1976D2]"
                            : "border-gray-400 bg-white"
                        }
                      `}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={isSelected ? "text-gray-900 font-medium" : "text-gray-700"}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
            {filteredOptions.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                No options found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface AndroidFiltersProps {
  filters: {
    circles: { selected: string[]; onChange: (v: string[]) => void };
    states: { selected: string[]; onChange: (v: string[]) => void };
    categories: { selected: string[]; onChange: (v: string[]) => void };
    agendas: { selected: string[]; onChange: (v: string[]) => void };
    sections: { selected: string[]; onChange: (v: string[]) => void };
  };
  filterOptions: {
    circles: string[];
    states: string[];
    categories: string[];
    agendas: string[];
    sections: string[];
  };
  onClearAll: () => void;
  activeFilterCount: number;
}

export function AndroidFilters({
  filters,
  filterOptions,
  onClearAll,
  activeFilterCount,
}: AndroidFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <AndroidFilter
            label="Circle New"
            options={filterOptions.circles}
            selectedValues={filters.circles.selected}
            onChange={filters.circles.onChange}
          />
          <AndroidFilter
            label="State"
            options={filterOptions.states}
            selectedValues={filters.states.selected}
            onChange={filters.states.onChange}
          />
          <AndroidFilter
            label="Cat"
            options={filterOptions.categories}
            selectedValues={filters.categories.selected}
            onChange={filters.categories.onChange}
          />
          <AndroidFilter
            label="Agendas"
            options={filterOptions.agendas}
            selectedValues={filters.agendas.selected}
            onChange={filters.agendas.onChange}
          />
          <AndroidFilter
            label="Section New"
            options={filterOptions.sections}
            selectedValues={filters.sections.selected}
            onChange={filters.sections.onChange}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 text-sm font-medium transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
