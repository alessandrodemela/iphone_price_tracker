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
};

type DataTableProps = {
  data: OfferData[];
};

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-8 text-gray-500">Nessun dato disponibile. Clicca su Aggiorna Dati.</div>;
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
            <th className="px-4 py-4 font-semibold">Prezzo Base</th>
            <th className="px-4 py-4 font-semibold">Sconto</th>
            <th className="px-4 py-4 font-semibold text-blue-600 dark:text-blue-400">Prezzo Finale</th>
            <th className="px-6 py-4 font-semibold">Promo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.modello}</td>
              <td className="px-4 py-4">{item.memoria}</td>
              <td className="px-4 py-4">{item.colore}</td>
              <td className="px-4 py-4 text-xs">{item.sim}</td>
              <td className="px-4 py-4">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                  {item.grado}
                </span>
              </td>
              <td className="px-4 py-4">€{item.prezzoListino.toFixed(2)}</td>
              <td className="px-4 py-4">
                {item.scontoPercentuale > 0 ? (
                  <span className="text-green-600 font-bold">-{item.scontoPercentuale}%</span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-4 font-bold text-lg text-gray-900 dark:text-white">€{item.prezzoFinale.toFixed(2)}</td>
              <td className="px-6 py-4">
                {item.notePromo && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium dark:bg-yellow-900 dark:text-yellow-300">
                    {item.notePromo}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
