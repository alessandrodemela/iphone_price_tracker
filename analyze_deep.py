import re
import json

for filename, label in [('source_refurbed_pro.txt', '16 PRO'), ('source_refurbed_pro_max.txt', '16 PRO MAX')]:
    html = open(filename, 'r', encoding='utf-8').read()
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

    # Deduplicate by suffix
    seen = set()
    unique_groups = []
    for (suffix, group) in groups_found:
        if suffix not in seen:
            seen.add(suffix)
            unique_groups.append((suffix, group))

    print(f'\n{"="*60}')
    print(f'{label} — {len(unique_groups)} gradi distinti trovati')
    print(f'{"="*60}')

    for suffix, group in unique_groups:
        variants = group.get('hasVariant', [])
        print(f'\n  Suffix="{suffix}" — {len(variants)} varianti')
        # Show all unique variant properties
        for v in variants:
            name = v.get('name', '')
            color = v.get('color', '')
            size = v.get('size', '')
            sku = v.get('sku', '')
            offer = v.get('offers', {})
            price = offer.get('price')
            url = offer.get('url', '')
            avail = offer.get('availability', '').split('/')[-1]
            # Extract anything after the SKU in the URL path
            url_path = re.search(r'/p/[^/]+/(\d+)([^/]*)/', url)
            url_suffix = url_path.group(2) if url_path else ''
            print(f'    [{avail}] SKU={sku} | {name} | €{price} | suffix={url_suffix}')
