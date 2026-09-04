import re
import json

# Check the live Refurbed site for SKU details to determine SIM type
# Looking at SKUs that appear in same grade/color/size group
# Pro: bianco 512 has SKU 213898 and 396014 in same suffix group
# Let's look at the actual URL structure

html = open('source_refurbed_pro.txt', 'r', encoding='utf-8').read()
pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
matches = re.findall(pattern, html, re.DOTALL)

# Find ALL variants across ALL groups, grouped by SKU
sku_to_variants = {}
for m in matches:
    m = m.strip()
    try:
        data = json.loads(m)
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get('@type') == 'ProductGroup' and item.get('hasVariant'):
                variants = item.get('hasVariant', [])
                first_url = variants[0].get('offers', {}).get('url', '')
                suffix_match = re.search(r'/(\d+)([a-z]*)/?(\?|$)', first_url)
                grade_suffix = suffix_match.group(2) if suffix_match else '?'
                
                for v in variants:
                    sku = v.get('sku')
                    url = v.get('offers', {}).get('url', '')
                    color = v.get('color', '')
                    size = v.get('size', '')
                    price = v.get('offers', {}).get('price')
                    key = f"{color}-{size}"
                    
                    if key not in sku_to_variants:
                        sku_to_variants[key] = []
                    entry = {'sku': sku, 'grade': grade_suffix, 'price': price, 'url': url}
                    if entry not in sku_to_variants[key]:
                        sku_to_variants[key].append(entry)
    except:
        pass

# Find keys with more than 4 SKUs (4 grades = expected, more = SIM variants)
print("=== COMBO WITH MULTIPLE SKUs PER GRADE (hints at SIM variant) ===")
for key, entries in sku_to_variants.items():
    # Group by grade
    by_grade = {}
    for e in entries:
        g = e['grade']
        by_grade.setdefault(g, []).append(e)
    # If any grade has more than 1 SKU, that's a SIM variant
    has_multi = any(len(v) > 1 for v in by_grade.values())
    if has_multi:
        print(f"\n  {key}:")
        for grade, variants in by_grade.items():
            if len(variants) > 1:
                print(f"    grade='{grade}': {len(variants)} SKUs!")
                for v in variants:
                    print(f"      SKU={v['sku']}, price={v['price']}, url=...{v['url'][-60:]}")
