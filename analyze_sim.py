import re
import json

# For Pro, find all SKU variants for same color+size to spot the SIM type difference
html = open('source_refurbed_pro.txt', 'r', encoding='utf-8').read()
pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
matches = re.findall(pattern, html, re.DOTALL)

groups_found = []
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
                suffix = suffix_match.group(2) if suffix_match else '?'
                groups_found.append((suffix, item))
    except:
        pass

# Deduplicate by suffix - keep one per grade
seen = set()
unique_groups = []
for (suffix, group) in groups_found:
    if suffix not in seen:
        seen.add(suffix)
        unique_groups.append((suffix, group))

# For each grade, check what the 'aa' group has in terms of ALL fields
print("=== FULL VARIANT DATA (suffix=aa, first 5) ===")
for suffix, group in unique_groups:
    if suffix == 'aa':
        for v in group.get('hasVariant', [])[:5]:
            print(json.dumps(v, indent=2, ensure_ascii=False))
        break

# Also look for SKUs that appear multiple times across different groups (same suffix)
print("\n=== SKUs with DUPLICATE color+size in same suffix group ===")
for suffix, group in unique_groups:
    seen_combos = {}
    for v in group.get('hasVariant', []):
        key = f"{v.get('color')}-{v.get('size')}"
        if key in seen_combos:
            print(f"  suffix={suffix}: DUPLICATE combo {key}")
            print(f"    SKU1={seen_combos[key].get('sku')}: {seen_combos[key].get('offers',{}).get('url','')[-60:]}")
            print(f"    SKU2={v.get('sku')}: {v.get('offers',{}).get('url','')[-60:]}")
        else:
            seen_combos[key] = v
