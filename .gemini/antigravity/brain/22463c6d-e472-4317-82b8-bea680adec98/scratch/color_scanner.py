import os
import re
import json

approved_colors = {
    '#0D2A5E', '#C8960A', '#C5D8F5', '#EDF4FF', '#F4F9FF', 
    '#88A8D0', '#D8ECFF', '#3A5A8A', '#F8FAFC', '#EEF5FF'
}

# Normalize approved colors to uppercase
approved_colors = {c.upper() for c in approved_colors}

base_dir = r'c:\xampp\htdocs\GSLC\resources\js\pages\admin'
hex_pattern = re.compile(r'#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}')

violations = []
all_files = []

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.tsx'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, base_dir)
            all_files.append(rel_path)
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    matches = hex_pattern.findall(line)
                    for match in matches:
                        color = match.upper()
                        if color not in approved_colors:
                            violations.append({
                                'file': rel_path,
                                'line': i + 1,
                                'color': match,
                                'context': line.strip()
                            })

# Separate clean and dirty files
dirty_files = {}
for v in violations:
    dirty_files[v['file']] = dirty_files.get(v['file'], 0) + 1

clean_files = [f for f in all_files if f not in dirty_files]

result = {
    'violations': violations,
    'clean_files': clean_files,
    'dirty_files': dirty_files
}

output_path = r'c:\xampp\htdocs\GSLC\.gemini\antigravity\brain\22463c6d-e472-4317-82b8-bea680adec98\scratch\scan_results.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=2)

print("Done")
