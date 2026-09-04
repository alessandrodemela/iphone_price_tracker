import re
import json

html = open('source_refurbed_pro.txt', 'r', encoding='utf-8').read()

pattern = r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>'
matches = re.findall(pattern, html, re.DOTALL)

groups_found = []
for i, m in enumerate(matches):
    m = m.strip()
    try:
        data = json.loads(m)
        items = data if isinstance(data, list) else [data]
        for item in items:
            if isinstance(item, dict) and item.get('@type') == 'ProductGroup':
                variants = item.get('hasVariant', [])
                if variants:
                    # Get the URL suffix to identify grade
                    first_url = variants[0].get('offers', {}).get('url', '')
                    # Extract the suffix between SKU number and /?
                    # e.g. .../213890aa/?offer=... => suffix is "aa"
                    # e.g. .../213890/?offer=... => suffix is ""
                    # e.g. .../213890b/?offer=... => suffix is "b"
                    suffix_match = re.search(r'/(\d+)([a-z]*)/?(\?|$)', first_url)
                    suffix = suffix_match.group(2) if suffix_match else '?'
                    groups_found.append((i, suffix, item))
                    print(f'Script #{i}: suffix="{suffix}", variants={len(variants)}')
    except:
        pass

print(f'\nUnique suffixes: {set(s for _,s,_ in groups_found)}')

# Now map suffixes to grades
GRADE_MAP = {
    'aa': 'Eccellente',
    'a': 'Eccellente',
    'b': 'Ottimo',
    'c': 'Buono',
    '': 'Standard',  # base URL = generic/mixed
}

# Show which groups we'd keep (deduplicate by suffix)
seen = set()
for (i, suffix, group) in groups_found:
    if suffix not in seen:
        seen.add(suffix)
        grade = GRADE_MAP.get(suffix, f'Unknown({suffix})')
        variants = group.get('hasVariant', [])
        print(f'\nKEEP Script #{i} suffix="{suffix}" => grade="{grade}", {len(variants)} variants')
        for v in variants[:2]:
            offer = v.get('offers', {})
            print(f'  {v.get("name")}: €{offer.get("price")}')
