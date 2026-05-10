import json
import os
import re

replacements = {
    '#0D1F3C': '#0D2A5E',
    '#1A2332': '#0D2A5E',
    '#1A3360': '#0D2A5E',
    '#0B1D3A': '#0D2A5E',
    '#4366BB': '#0D2A5E',
    '#CFA030': '#C8960A',
    '#C9A84C': '#C8960A',
    '#B8923E': '#C8960A'
}

# Compile regex with case-insensitive flag
patterns = {re.compile(re.escape(k), re.IGNORECASE): v for k, v in replacements.items()}

base_dir = r'c:\xampp\htdocs\GSLC\resources\js\pages\admin'
analysis = {}

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, base_dir)
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            file_replacements = []
            for pattern, target in patterns.items():
                matches = pattern.findall(content)
                if matches:
                    file_replacements.append({
                        'from': matches[0], # Keep original case for reporting
                        'to': target,
                        'count': len(matches)
                    })
            
            if file_replacements:
                analysis[rel_path] = file_replacements

print(json.dumps(analysis, indent=2))
