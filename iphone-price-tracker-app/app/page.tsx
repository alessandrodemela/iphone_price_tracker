"use client";

import React, { useState } from 'react';
import { KPICard } from '@/components/KPICard';
import { DataTable, OfferData } from '@/components/DataTable';

export default function Dashboard() {
  const [data, setData] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scrape');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Errore fetching data", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              iPhone Price Tracker <span className="text-blue-600">Refurbed</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Monitoraggio Prezzi iPhone 16 Pro e Pro Max (Gradi: Premium/Ottimo, Batteria: Nuova)
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={fetchData}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Aggiornamento in corso...
                </>
              ) : (
                "Aggiorna Prezzi / Fetch Dati"
              )}
            </button>
            {lastUpdate && <span className="text-xs text-gray-500">Ultimo aggiornamento: {lastUpdate}</span>}
          </div>
        </header>

        {/* KPI Section */}
        {data.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KPICard 
              model="iPhone 16 Pro" 
              bestPrice={Math.min(...data.filter(d => d.modello.includes("16 Pro") && !d.modello.includes("Max")).map(d => d.prezzoFinale), 9999)}
              specs="Memoria: 256GB, Grado: Premium, Batteria: Nuova, SIM: Dual, Colore: Titanio Nero"
              promo="⌛ 8% di sconto: solo oggi"
            />
            <KPICard 
              model="iPhone 16 Pro Max" 
              bestPrice={Math.min(...data.filter(d => d.modello.includes("Max")).map(d => d.prezzoFinale), 9999)}
              specs="Memoria: 512GB, Grado: Ottimo, Batteria: Nuova, SIM: eSIM, Colore: Titanio Naturale"
            />
          </section>
        )}

        {/* Data Table Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Tutte le Offerte Valide</h2>
          <DataTable data={data} />
        </section>

      </div>
    </div>
  );
}
