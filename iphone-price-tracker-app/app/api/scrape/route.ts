import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Maps URL suffix to grade label
const GRADE_MAP: Record<string, string> = {
  'aa': 'Eccellente',
  'a':  'Eccellente',
  'b':  'Ottimo',
  'c':  'Buono',
  '':   'Standard',
};

function extractSuffix(offerUrl: string): string {
  // e.g. https://www.refurbed.it/p/iphone-16-pro/213890aa/?offer=...
  //       => suffix "aa"
  // e.g. https://www.refurbed.it/p/iphone-16-pro/213890/?offer=...
  //       => suffix ""
  const m = offerUrl.match(/\/\d+([a-z]*)\/\?/);
  return m ? m[1] : '';
}

async function scrapeModel(url: string, modelloBase: string): Promise<any[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  // Collect ALL ProductGroup JSON-LD blocks (one per grade on Refurbed)
  const allGroups: { suffix: string; group: any }[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (!content || !content.includes('"@type":"ProductGroup"')) return;
    try {
      const parsed = JSON.parse(content);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item['@type'] === 'ProductGroup' && Array.isArray(item.hasVariant)) {
          const firstUrl = item.hasVariant[0]?.offers?.url ?? '';
          const suffix = extractSuffix(firstUrl);
          allGroups.push({ suffix, group: item });
        }
      }
    } catch (_) {
      // ignore
    }
  });

  if (allGroups.length === 0) {
    throw new Error(`No ProductGroup found for ${url}`);
  }

  // Deduplicate by suffix (keep first occurrence per grade)
  const seenSuffixes = new Set<string>();
  const uniqueGroups = allGroups.filter(({ suffix }) => {
    if (seenSuffixes.has(suffix)) return false;
    seenSuffixes.add(suffix);
    return true;
  });

  const offers: any[] = [];

  for (const { suffix, group } of uniqueGroups) {
    const grado = GRADE_MAP[suffix] ?? `Grado ${suffix}`;

    for (const variant of group.hasVariant) {
      const price = variant.offers?.price;
      if (!price) continue;

      const priceNum = typeof price === 'number' ? price : parseFloat(price);

      offers.push({
        modello: modelloBase,
        memoria: variant.size ?? 'Sconosciuta',
        colore: variant.color ?? 'Sconosciuto',
        sim: 'Dual SIM',
        grado,
        batteria: 'Standard',
        prezzoListino: priceNum,
        scontoPercentuale: 0,
        prezzoFinale: priceNum,
        notePromo: '',
        sku: String(variant.sku ?? ''),
        linkOfferta: variant.offers?.url ?? '',
      });
    }
  }

  return offers;
}

export async function GET() {
  try {
    const [pro, proMax] = await Promise.all([
      scrapeModel('https://www.refurbed.it/p/iphone-16-pro/', 'iPhone 16 Pro'),
      scrapeModel('https://www.refurbed.it/p/iphone-16-pro-max/', 'iPhone 16 Pro Max'),
    ]);

    const data = [...pro, ...proMax];

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Errore durante lo scraping' },
      { status: 500 }
    );
  }
}
