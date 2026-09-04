import re
import json

html = open('source_refurbed_pro.txt', 'r', encoding='utf-8').read()

# Find all JSON-LD script contents
pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
matches = re.findall(pattern, html, re.DOTALL)
print(f'Total JSON-LD scripts found: {len(matches)}')

groups_found = []
for i, m in enumerate(matches):
    m = m.strip()
    try:
        data = json.loads(m)
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get('@type') == 'ProductGroup':
                groups_found.append((i, item))
                name = item.get('name')
                variants = item.get('hasVariant', [])
                print(f'\n--- Script #{i}: ProductGroup "{name}", variants={len(variants)} ---')
                for v in variants[:3]:
                    offer = v.get('offers', {})
                    url_suffix = offer.get('url', '')
                    # Extract the path suffix (the part between the sku and ?)
                    price = offer.get('price')
                    print(f'  Variant: {v.get("name")}, price={price}, url_end=...{url_suffix[-50:]}')
    except Exception as e:
        pass

print(f'\nTotal ProductGroups found: {len(groups_found)}')
