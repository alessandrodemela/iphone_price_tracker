import React from 'react';

export type OfferData = {
  modello: string;
  memoria: string;
  colore: string;
  sim: string;
  grado: string;
  batteria: string;
  prezzoListino: number;
  scontoPercentuale: number;
  prezzoFinale: number;
  notePromo: string;
  sku?: string;
  linkOfferta?: string;
};

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  'Premium':      { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-800 dark:text-violet-200' },
  'Ottimo':       { bg: 'bg-blue-100 dark:bg-blue-900',     text: 'text-blue-800 dark:text-blue-200' },
  'Buono':        { bg: 'bg-green-100 dark:bg-green-900',   text: 'text-green-800 dark:text-green-200' },
  'Molto Buono':  { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
};

type DataTableProps = {
  data: OfferData[];
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nessun dato disponibile. Clicca su <strong>Aggiorna Prezzi</strong>.
      </div>
    );
  }

  return (
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
            <th className="px-4 py-4 font-semibold text-blue-600 dark:text-blue-400">Prezzo</th>
            <th className="px-6 py-4 font-semibold">Link</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const gradeStyle = GRADE_COLORS[item.grado] ?? { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
            return (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.modello}</td>
                <td className="px-4 py-4 whitespace-nowrap">{item.memoria}</td>
                <td className="px-4 py-4 capitalize">{item.colore}</td>
                <td className="px-4 py-4 text-xs whitespace-nowrap">{item.sim}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${gradeStyle.bg} ${gradeStyle.text}`}>
                    {item.grado}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs">{item.batteria}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {item.scontoPercentuale > 0 && (
                    <span className="block text-xs text-gray-400 line-through">
                      €{(item.prezzoListino ?? 0).toFixed(2)}
                    </span>
                  )}
                  <span className="font-bold text-base text-gray-900 dark:text-white">
                    €{(item.prezzoFinale ?? 0).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {item.scontoPercentuale > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full w-fit">
                        🏷️ -{item.scontoPercentuale}%
                      </span>
                    )}
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
