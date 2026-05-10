import json

# Approved colors (standardized to uppercase)
approved_colors = {
    '#0D2A5E', '#C8960A', '#C5D8F5', '#EDF4FF', '#F4F9FF', 
    '#88A8D0', '#D8ECFF', '#3A5A8A', '#F8FAFC', '#EEF5FF'
}
approved_colors = {c.upper() for c in approved_colors}

json_path = r'c:\xampp\htdocs\GSLC\.gemini\antigravity\brain\22463c6d-e472-4317-82b8-bea680adec98\scratch\scan_results.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

violations = data['violations']
clean_files = data['clean_files']
dirty_files_counts = data['dirty_files']

# Generate Table
print("| File | Line | Color | Context |")
print("|------|------|-------|---------|")
for v in violations:
    # Escape pipe characters in context for markdown table
    context = v['context'].replace('|', '\\|')
    print(f"| {v['file']} | {v['line']} | {v['color']} | {context} |")

print("\n## File Grouping")

print("\n### List 1 (Clean)")
if not clean_files:
    print("- None")
else:
    for f in sorted(clean_files):
        print(f"- {f}")

print("\n### List 2 (Needs fix)")
if not dirty_files_counts:
    print("- None")
else:
    # Sort dirty files by name
    for f in sorted(dirty_files_counts.keys()):
        print(f"- {f} ({dirty_files_counts[f]} violations)")
