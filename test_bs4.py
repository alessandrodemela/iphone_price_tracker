import bs4
with open('source_refurbed_pro.txt', 'r', encoding='utf-8') as f:
    html = f.read()
soup = bs4.BeautifulSoup(html, 'html.parser')
print(soup.title.text if soup.title else 'No title')
