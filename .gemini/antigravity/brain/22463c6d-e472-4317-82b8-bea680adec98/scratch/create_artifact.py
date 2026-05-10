import os

formatted_output_path = r'c:\xampp\htdocs\GSLC\.gemini\antigravity\brain\22463c6d-e472-4317-82b8-bea680adec98\scratch\formatted_output.txt'
artifact_path = r'C:\Users\Pc-27\.gemini\antigravity\brain\22463c6d-e472-4317-82b8-bea680adec98\color_violations_report.md'

# Check if file exists and try different encodings
if os.path.exists(formatted_output_path):
    try:
        with open(formatted_output_path, 'r', encoding='utf-16') as f:
            table_content = f.read()
    except UnicodeError:
        with open(formatted_output_path, 'r', encoding='utf-8', errors='ignore') as f:
            table_content = f.read()
else:
    table_content = "Error: Formatted output file not found."

header = """# Unapproved Color Violations Audit

This document lists all hex colors found in `resources/js/pages/admin/` that are not part of the approved color palette.

## Approved Colors
- `#0D2A5E` (Navy)
- `#C8960A` (Gold)
- `#C5D8F5` (Border Primary)
- `#EDF4FF` (Sidebar/Header Bg)
- `#F4F9FF` (Page Bg)
- `#88A8D0` (Text Subtle)
- `#D8ECFF` (Sidebar Hover)
- `#3A5A8A` (Text Secondary)
- `#F8FAFC` (Table Header Bg)
- `#EEF5FF` (Divider Subtle)

## Findings
"""

with open(artifact_path, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(table_content)

print("Artifact created at " + artifact_path)
