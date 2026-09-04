'use client';

import React, { useMemo, useState } from 'react';

export type OfferData = {
  modello: string;
  memoria: string;
  colore: string;
  sim: string;
  grado: string;
  batteria: string;
  prezzoListino: number;
  sku?: string;
  linkOfferta?: string;
};

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  'Premium':     { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-800 dark:text-violet-200' },
  'Ottimo':      { bg: 'bg-blue-100 dark:bg-blue-900',     text: 'text-blue-800 dark:text-blue-200' },
  'Buono':       { bg: 'bg-green-100 dark:bg-green-900',   text: 'text-green-800 dark:text-green-200' },
  'Molto Buono': { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
};

type SortOrder = 'none' | 'asc' | 'desc';

type Filters = {
  modello: string;
  memoria: string;
  colore: string;
  sim: string;
  grado: string;
  batteria: string;
};

type DataTableProps = {
  data: OfferData[];
};

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr)).sort();
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow min-w-[130px]"
      >
        <option value="">Tutti</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [filters, setFilters] = useState<Filters>({
    modello: '',
    memoria: '',
    colore: '',
    sim: '',
    grado: '',
    batteria: '',
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  // Derive unique options from the full dataset
  const options = useMemo(
    () => ({
      modello:  unique(data.map((d) => d.modello)),
      memoria:  unique(data.map((d) => d.memoria)),
      colore:   unique(data.map((d) => d.colore)),
      sim:      unique(data.map((d) => d.sim)),
      grado:    unique(data.map((d) => d.grado)),
      batteria: unique(data.map((d) => d.batteria)),
    }),
    [data]
  );

  const setFilter = (key: keyof Filters) => (value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const resetFilters = () => {
    setFilters({ modello: '', memoria: '', colore: '', sim: '', grado: '', batteria: '' });
    setSortOrder('none');
  };

  const filtered = useMemo(() => {
    let rows = data.filter((d) => {
      return (
        (!filters.modello  || d.modello  === filters.modello)  &&
        (!filters.memoria  || d.memoria  === filters.memoria)  &&
        (!filters.colore   || d.colore   === filters.colore)   &&
        (!filters.sim      || d.sim      === filters.sim)      &&
        (!filters.grado    || d.grado    === filters.grado)    &&
        (!filters.batteria || d.batteria === filters.batteria)
      );
    });

    if (sortOrder === 'asc') {
      rows = [...rows].sort((a, b) => a.prezzoListino - b.prezzoListino);
    } else if (sortOrder === 'desc') {
      rows = [...rows].sort((a, b) => b.prezzoListino - a.prezzoListino);
    }

    return rows;
  }, [data, filters, sortOrder]);

  const hasActiveFilters =
    Object.values(filters).some(Boolean) || sortOrder !== 'none';

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nessun dato disponibile. Clicca su <strong>Aggiorna Prezzi</strong>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Modello"  value={filters.modello}  options={options.modello}  onChange={setFilter('modello')} />
          <FilterSelect label="Memoria"  value={filters.memoria}  options={options.memoria}  onChange={setFilter('memoria')} />
          <FilterSelect label="Colore"   value={filters.colore}   options={options.colore}   onChange={setFilter('colore')} />
          <FilterSelect label="SIM"      value={filters.sim}      options={options.sim}      onChange={setFilter('sim')} />
          <FilterSelect label="Grado"    value={filters.grado}    options={options.grado}    onChange={setFilter('grado')} />
          <FilterSelect label="Batteria" value={filters.batteria} options={options.batteria} onChange={setFilter('batteria')} />

          {/* Sort toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Prezzo
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 h-[38px]">
              {(['none', 'asc', 'desc'] as SortOrder[]).map((order) => {
                const labels: Record<SortOrder, string> = {
                  none: '↕ Default',
                  asc:  '↑ Min→Max',
                  desc: '↓ Max→Min',
                };
                const isActive = sortOrder === order;
                return (
                  <button
                    key={order}
                    onClick={() => setSortOrder(order)}
                    className={`px-3 text-xs font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {labels[order]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-1">
              <label className="text-xs opacity-0 select-none">Reset</label>
              <button
                onClick={resetFilters}
                className="h-[38px] px-4 text-sm font-semibold rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                ✕ Reset
              </button>
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          {filtered.length} / {data.length} offerte mostrate
        </p>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Modello</th>
              <th className="px-4 py-4 font-semibold">Memoria</th>
              <th className="px-4 py-4 font-semibold">Colore</th>
              <th className="px-4 py-4 font-semibold">SIM</th>
              <th className="px-4 py-4 font-semibold">Grado</th>
              <th className="px-4 py-4 font-semibold">Batteria</th>
              <th className="px-4 py-4 font-semibold text-blue-600 dark:text-blue-400">
                Prezzo
              </th>
              <th className="px-6 py-4 font-semibold">Link</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-10 text-gray-400 dark:text-gray-500"
                >
                  Nessuna offerta corrisponde ai filtri selezionati.
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const gradeStyle =
                  GRADE_COLORS[item.grado] ?? {
                    bg: 'bg-gray-100 dark:bg-gray-800',
                    text: 'text-gray-700 dark:text-gray-300',
                  };
                return (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {item.modello}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{item.memoria}</td>
                    <td className="px-4 py-4 capitalize">{item.colore}</td>
                    <td className="px-4 py-4 text-xs whitespace-nowrap">{item.sim}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gradeStyle.bg} ${gradeStyle.text}`}
                      >
                        {item.grado}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">{item.batteria}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-base text-gray-900 dark:text-white">
                        €{(item.prezzoListino ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.linkOfferta && (
                        <a
                          href={item.linkOfferta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-xs font-medium underline underline-offset-2"
                        >
                          Vedi →
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
