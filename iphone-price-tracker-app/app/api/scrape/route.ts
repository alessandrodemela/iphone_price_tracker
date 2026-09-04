import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// ─── Grade mapping ────────────────────────────────────────────────────────────
// Suffix found in the offer URL after the SKU number
// e.g. /213890aa/?offer=... → suffix "aa" → Premium
const GRADE_MAP: Record<string, string> = {
  'aa': 'Premium',
  'a':  'Premium',
  'b':  'Ottimo',
  '':   'Buono',
  'c':  'Molto Buono',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractGradeSuffix(offerUrl: string): string {
  // Matches the optional letter(s) between the SKU number and the trailing slash+query
  // e.g. /213890aa/?offer=... → "aa"
  //      /213890/?offer=...   → ""
  const m = offerUrl.match(/\/\d+([a-z]*)\/\?/);
  return m ? m[1] : '';
}

/**
 * Fetch a single SKU page to determine the SIM type:
 *  "Dual SIM (Physical + eSIM)" | "Dual SIM (2x eSIM)" | "Dual SIM"
 */
async function fetchSimType(
  baseProductUrl: string,
  sku: number,
  gradeSuffix: string
): Promise<string> {
  const url = `${baseProductUrl}${sku}${gradeSuffix}/`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible)', 'Accept-Language': 'it-IT,it;q=0.9' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return 'Dual SIM';
    const html = await res.text();

    // ── SIM type from page <title> ──────────────────────────────────────────
    // e.g. "Apple iPhone 16 Pro 512 GB bianco Dual-SIM (eSIM, Nano-SIM) – refurbed"
    //      "Apple iPhone 16 Pro 512 GB bianco Dual-SIM (2 x eSIM) – refurbed"
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    if (title.includes('2 x eSIM') || title.includes('2x eSIM')) {
      return 'Dual SIM (2x eSIM)';
    } else if (title.includes('eSIM, Nano-SIM') || title.includes('Nano-SIM')) {
      return 'Dual SIM (Physical + eSIM)';
    }
    return 'Dual SIM';
  } catch {
    return 'Dual SIM';
  }
}

// ─── Main scrape function ─────────────────────────────────────────────────────

async function scrapeModel(
  url: string,
  modelloBase: string
): Promise<any[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'it-IT,it;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  // ── Collect ALL distinct ProductGroup blocks (one per grade on Refurbed) ──
  const allGroups: { suffix: string; group: any }[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (!content?.includes('"@type":"ProductGroup"')) return;
    try {
      const parsed = JSON.parse(content);
      const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item['@type'] === 'ProductGroup' && Array.isArray(item.hasVariant)) {
          const firstUrl = item.hasVariant[0]?.offers?.url ?? '';
          const suffix = extractGradeSuffix(firstUrl);
          allGroups.push({ suffix, group: item });
        }
      }
    } catch { /* ignore */ }
  });

  if (allGroups.length === 0) throw new Error(`No ProductGroup found for ${url}`);

  // ── Deduplicate: keep first occurrence of each grade suffix ──
  const seenSuffixes = new Set<string>();
  const uniqueGroups = allGroups.filter(({ suffix }) => {
    if (seenSuffixes.has(suffix)) return false;
    seenSuffixes.add(suffix);
    return true;
  });

  // ── Collect all unique SKUs across all grades to fetch SIM types in parallel ──
  // We only need to fetch the SIM type once per SKU (it's the same across grades)
  const allSkus = new Set<number>();
  for (const { group } of uniqueGroups) {
    for (const v of group.hasVariant) {
      if (v.sku) allSkus.add(v.sku);
    }
  }

  // Fetch SIM type for each unique SKU in parallel.
  // We use the preferred suffix to minimise calls — SIM type is the same across grades.
  const preferredSuffix = seenSuffixes.has('aa') ? 'aa' : (seenSuffixes.has('b') ? 'b' : '');
  const simCache = new Map<number, string>();

  await Promise.all(
    Array.from(allSkus).map(async (sku) => {
      const sim = await fetchSimType(url, sku, preferredSuffix);
      simCache.set(sku, sim);
    })
  );

  // ── Build the offers array ──
  const offers: any[] = [];

  for (const { suffix, group } of uniqueGroups) {
    const grado = GRADE_MAP[suffix] ?? `Grado ${suffix}`;

    for (const variant of group.hasVariant) {
      const price = variant.offers?.price;
      if (!price) continue;

      const priceNum = typeof price === 'number' ? price : parseFloat(price);
      const sku: number = variant.sku;
      const sim = simCache.get(sku) ?? 'Dual SIM';
      const avail = variant.offers?.availability ?? '';
      const available = avail.includes('InStock');

      if (!available) continue; // skip OutOfStock variants

      offers.push({
        modello: modelloBase,
        memoria: variant.size ?? 'Sconosciuta',
        colore: variant.color ?? 'Sconosciuto',
        sim,
        grado,
        batteria: 'Nuova',
        prezzoListino: priceNum,
        sku: String(sku ?? ''),
        linkOfferta: variant.offers?.url ?? '',
      });
    }
  }

  return offers;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const [pro, proMax, pro15Max] = await Promise.all([
      scrapeModel('https://www.refurbed.it/p/iphone-16-pro/', 'iPhone 16 Pro'),
      scrapeModel('https://www.refurbed.it/p/iphone-16-pro-max/', 'iPhone 16 Pro Max'),
      scrapeModel('https://www.refurbed.it/p/iphone-15-pro-max/', 'iPhone 15 Pro Max'),
    ]);

    const data = [...pro, ...proMax, ...pro15Max];

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { success: false, error: error.message ?? 'Errore durante lo scraping' },
      { status: 500 }
    );
  }
}
