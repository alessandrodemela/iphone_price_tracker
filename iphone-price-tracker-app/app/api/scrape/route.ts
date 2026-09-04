import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const urls = [
      'https://www.refurbed.it/p/iphone-16-pro/',
      'https://www.refurbed.it/p/iphone-16-pro-max/'
    ];

    let allExtractedOffers: any[] = [];

    for (const url of urls) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!res.ok) {
        console.error(`Failed to fetch ${url}: ${res.status}`);
        continue;
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
            const productGroup = Array.isArray(json) ? json.find(j => j['@type'] === 'ProductGroup') : (json['@type'] === 'ProductGroup' ? json : null);
            if (productGroup) {
              parsedData = productGroup;
              return false; // break the loop
            }
          } catch (e) {
            // ignore parsing errors for individual scripts
          }
        }
      });

      if (!parsedData || !parsedData.hasVariant) {
        console.warn(`Could not find ProductGroup data in the HTML for ${url}`);
        continue;
      }

      const isProMax = url.includes('pro-max');
      const modelloBase = isProMax ? "iPhone 16 Pro Max" : "iPhone 16 Pro";

      // Map the variants to the frontend expected format
      parsedData.hasVariant.forEach((variant: any) => {
        const price = variant.offers?.price;
        if (price) {
          let grado = "Eccellente"; // Default
          const offerUrl = variant.offers.url || "";
          if (offerUrl.endsWith('c/') || offerUrl.includes('c/?')) {
            grado = "Buono";
          } else if (offerUrl.endsWith('b/') || offerUrl.includes('b/?')) {
            grado = "Ottimo";
          } else if (offerUrl.endsWith('a/') || offerUrl.includes('a/?') || offerUrl.endsWith('aa/') || offerUrl.includes('aa/?')) {
            grado = "Eccellente";
          } else if (!offerUrl.match(/[a-z]\/\?/) && offerUrl.includes('/?offer=')) {
              // base url often is Eccellente or default
              grado = "Eccellente";
          }

          allExtractedOffers.push({
            modello: modelloBase,
            memoria: variant.size || "Sconosciuta",
            colore: variant.color || "Sconosciuto",
            sim: "Dual SIM", // Defaulting as it's not explicitly in the JSON LD
            grado: grado,
            batteria: "Standard", // Defaulting
            prezzoListino: price, 
            scontoPercentuale: 0,
            prezzoFinale: price,
            notePromo: "",
            sku: variant.sku || offerUrl // keeping sku or offerurl for uniqueness
          });
        }
      });
    }

    // Remove duplicates if any (based on color, memory, and grade)
    const uniqueOffers = Array.from(new Map(allExtractedOffers.map(item =>
      [`${item.modello}-${item.colore}-${item.memoria}-${item.grado}`, item]
    )).values());

    return NextResponse.json({ success: true, data: uniqueOffers });
  } catch (error: any) {
    console.error("Scraping error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Errore durante lo scraping' }, { status: 500 });
  }
}
