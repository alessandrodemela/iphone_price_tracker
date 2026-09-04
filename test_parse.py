import bs4
import json

def parse_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    soup = bs4.BeautifulSoup(html, 'html.parser')
    
    # Let's find some elements that could represent variants. 
    # Usually Refurbed has a script tag with JSON data, or inputs with data-sku
    scripts = soup.find_all('script', type='application/json')
    for script in scripts:
        if 'sku' in script.text.lower() or 'price' in script.text.lower():
            print("Found interesting script tag:", script.text[:200])
    
    # Or maybe it's in a div with data-sku
    divs = soup.find_all(attrs={"data-sku": True})
    if divs:
        print(f"Found {len(divs)} elements with data-sku")
        print("Sample:", divs[0])
