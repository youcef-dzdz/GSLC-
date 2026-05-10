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

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            new_content = content
            for pattern, target in patterns.items():
                new_content = pattern.sub(target, new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")
