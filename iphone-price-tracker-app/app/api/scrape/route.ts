import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const url = 'https://www.refurbed.it/p/iphone-16-pro/';
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let parsedData: any = null;

    // Find the JSON-LD script containing the ProductGroup
    $('script[type="application/ld+json"]').each((_, el) => {
      const content = $(el).html();
      if (content && content.includes('"@type":"ProductGroup"')) {
        try {
          const json = JSON.parse(content);
          const productGroup = Array.isArray(json) ? json[0] : json;
          if (productGroup['@type'] === 'ProductGroup') {
            parsedData = productGroup;
            return false; // break the loop
          }
        } catch (e) {
          // ignore parsing errors for individual scripts
        }
      }
    });

    if (!parsedData || !parsedData.hasVariant) {
      throw new Error('Could not find ProductGroup data in the HTML');
    }

    const extractedOffers = [];

    // Map the variants to the frontend expected format
    parsedData.hasVariant.forEach((variant: any) => {
      const price = variant.offers?.price;
      if (price) {
        // Here we do a best-effort mapping based on the name
        // Example name: "iPhone 16 Pro - marrone 128 GB"
        extractedOffers.push({
          modello: "iPhone 16 Pro",
          memoria: variant.size || "Sconosciuta",
          colore: variant.color || "Sconosciuto",
          sim: "Dual SIM", // Defaulting as it's not explicitly in the JSON LD
          grado: "Premium", // Defaulting, as specific grades are in the SKU/URL
          batteria: "Nuova", // Defaulting
          prezzoListino: price, 
          scontoPercentuale: 0,
          prezzoFinale: price,
          notePromo: "",
        });
      }
    });

    // Remove duplicates if any (based on color and memory)
    const uniqueOffers = Array.from(new Map(extractedOffers.map(item =>
      [`${item.colore}-${item.memoria}`, item]
    )).values());

    return NextResponse.json({ success: true, data: uniqueOffers });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Errore durante lo scraping' }, { status: 500 });
  }
}
