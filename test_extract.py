import json
import re

html = open('source_refurbed_pro.txt', 'r', encoding='utf-8').read()

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)

for s in scripts:
    s = s.strip()
    if 'preloaded' in s.lower() or 'state' in s.lower() or 'apollo' in s.lower() or '__' in s:
        if len(s) > 100:
            print("Found script containing state:", s[:200])
