import React from 'react';

type KPICardProps = {
  model: string;
  bestPrice: number;
  specs: string;
  promo?: string;
};

export const KPICard: React.FC<KPICardProps> = ({ model, bestPrice, specs, promo }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{model}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
          €{bestPrice.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">Miglior Prezzo</span>
      </div>
      
      {promo && (
        <div className="mb-3 inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
          {promo}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <span className="font-semibold block mb-1">Specifiche associate:</span>
          {specs}
        </p>
      </div>
    </div>
  );
};
