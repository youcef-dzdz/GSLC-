import json
from collections import Counter

json_path = r'c:\xampp\htdocs\GSLC\.gemini\antigravity\brain\22463c6d-e472-4317-82b8-bea680adec98\scratch\scan_results.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

violations = data['violations']
color_counts = Counter(v['color'].upper() for v in violations)

# Approved colors (standardized to uppercase)
approved_colors = {
    '#0D2A5E', '#C8960A', '#C5D8F5', '#EDF4FF', '#F4F9FF', 
    '#88A8D0', '#D8ECFF', '#3A5A8A', '#F8FAFC', '#EEF5FF'
}
approved_colors = {c.upper() for c in approved_colors}

# Known semantic/approved colors from uidesign.md that were NOT in the restricted list
uidesign_approved = {
    '#A87A08', '#FFF3C0', '#7A5800', '#FFFFFF', '#E2E8F0', '#5A80BB', '#6A90C0', 
    '#E6F7F0', '#A8DFC4', '#2A8A5A', '#E0EEFF', '#1A4A9A', '#FFF0F0', '#8A2020',
    '#A0C0E8'
}
uidesign_approved = {c.upper() for c in uidesign_approved}

# Heuristic categorization
semantic = {}
brand_violations = {}
neutral = {}

def is_neutral(hex_color):
    # Very simple heuristic for grays/whites/blacks
    h = hex_color.lstrip('#')
    if len(h) == 3:
        h = ''.join([c*2 for c in h])
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    # If RGB values are very close, it's a gray/neutral
    return max(r, g, b) - min(r, g, b) < 20

for color, count in color_counts.items():
    if color in approved_colors:
        continue
    
    if color in uidesign_approved:
        semantic[color] = count
        continue
        
    # Standard Tailwind/Semantic patterns
    # Greenish (Success)
    if color.startswith('#D1FAE5') or color.startswith('#065F46') or color.startswith('#10B981') or color.startswith('#F0FDF4') or color.startswith('#166534') or color.startswith('#BBF7D0'):
        semantic[color] = count
    # Reddish (Error)
    elif color.startswith('#FEE2E2') or color.startswith('#991B1B') or color.startswith('#EF4444') or color.startswith('#FEF2F2') or color.startswith('#B91C1C') or color.startswith('#FECACA'):
        semantic[color] = count
    # Yellow/Amber (Warning)
    elif color.startswith('#FEF3C7') or color.startswith('#92400E') or color.startswith('#F59E0B') or color.startswith('#FFFBEB') or color.startswith('#CFA030'):
        # CFA030 is mentioned as wrong gold variant in uidesign.md but also used in warning
        semantic[color] = count
    # Blueish (Info)
    elif color.startswith('#EFF6FF') or color.startswith('#1E40AF') or color.startswith('#3B82F6') or color.startswith('#BFDBFE'):
        semantic[color] = count
    # Neutral
    elif is_neutral(color) or color.startswith('#F1F5F9') or color.startswith('#F8FAFC') or color.startswith('#F9FAFB') or color.startswith('#E5E7EB') or color.startswith('#94A3B8') or color.startswith('#64748B'):
        neutral[color] = count
    # Brand Violations
    else:
        brand_violations[color] = count

result = {
    'semantic': semantic,
    'brand_violations': brand_violations,
    'neutral': neutral
}

print(json.dumps(result, indent=2))
