import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In un caso reale, qui faresti un fetch() all'URL di Refurbed.
    // fetch('https://www.refurbed.it/p/iphone-16-pro/')
    
    // Logica di estrazione (mockata/esemplificativa basata sui requisiti)
    const mockData = [
      {
        modello: "iPhone 16 Pro",
        memoria: "256GB",
        colore: "Titanio Nero",
        sim: "Dual SIM",
        grado: "Premium",
        batteria: "Nuova",
        prezzoListino: 1200,
        scontoPercentuale: 8,
        prezzoFinale: 1104,
        notePromo: "⌛ 8% di sconto: solo oggi",
      },
      {
        modello: "iPhone 16 Pro Max",
        memoria: "512GB",
        colore: "Titanio Naturale",
        sim: "eSIM",
        grado: "Ottimo",
        batteria: "Nuova",
        prezzoListino: 1450,
        scontoPercentuale: 0,
        prezzoFinale: 1450,
        notePromo: "",
      }
    ];

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Errore durante lo scraping' }, { status: 500 });
  }
}
