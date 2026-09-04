import urllib.request
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'it-IT,it;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def fetch_page(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read().decode('utf-8', errors='replace')

# Fetch the individual variant page and look at the hasVariant data to find SIM info
for sku, suffix, label in [('213898', 'aa', 'bianco-512-Physical+eSIM?'), ('396014', 'aa', 'bianco-512-2xeSIM?')]:
    url = f'https://www.refurbed.it/p/iphone-16-pro/{sku}{suffix}/'
    print(f"\n=== {label} | {url} ===")
    try:
        html = fetch_page(url)
        
        # Find page title
        title = re.search(r'<title[^>]*>(.*?)</title>', html)
        if title:
            print(f"  TITLE: {title.group(1).strip()[:120]}")
        
        # Look for JSON-LD and find the specific variant data
        jld_matches = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', html, re.DOTALL)
        for m in jld_matches:
            try:
                data = json.loads(m.strip())
                items = data if isinstance(data, list) else [data]
                for item in items:
                    if item.get('@type') == 'ProductGroup':
                        # Find the variant matching THIS sku
                        for v in item.get('hasVariant', []):
                            if str(v.get('sku')) == sku:
                                print(f"  VARIANT FOUND:")
                                print(f"    name: {v.get('name')}")
                                print(f"    color: {v.get('color')}")
                                print(f"    size: {v.get('size')}")
                                print(f"    description (first 300): {v.get('description','')[:300]}")
                                print(f"    all keys: {list(v.keys())}")
            except:
                pass
        
        # Also look for any "eSIM" or "SIM" text near the SKU number
        sim_pattern = re.findall(rf'.{{0,50}}{sku}.{{0,100}}', html)
        for s in sim_pattern[:3]:
            if 'sim' in s.lower() or 'esim' in s.lower():
                print(f"  SKU+SIM context: {s}")
                
        # Search for "eSIM" mentions with context
        esim_mentions = re.findall(r'.{0,40}[Ee][Ss][Ii][Mm].{0,40}', html)
        print(f"  eSIM mentions: {esim_mentions[:5]}")
        
        # Search for "SIM" in meta/structured data
        sim_mentions = re.findall(r'.{0,30}[^A-Za-z][Ss][Ii][Mm][^A-Za-z].{0,30}', html)
        print(f"  SIM mentions (first 3): {sim_mentions[:3]}")
        
    except Exception as e:
        print(f"ERROR: {e}")
