import re
import json

with open('C:\\\\Users\\\\abhay\\\\Desktop\\\\Shivalaya Panache Menu\\\\supabase\\\\seed.sql', 'r') as f:
    sql = f.read()

pattern = r"\(\(SELECT id FROM restaurants WHERE slug = 'panache-shivalaya'\),\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(true|false),\s*(\d+)\)"
matches = re.findall(pattern, sql)

mock_data = []
for i, match in enumerate(matches):
    mock_data.append({
        'id': str(i + 1),
        'section': match[0],
        'name': match[1],
        'price': int(match[2]),
        'veg': match[3] == 'true',
        'available': True,
        'sort_order': int(match[4])
    })

mock_data_str = json.dumps(mock_data, indent=2)

use_menu_path = 'C:\\\\Users\\\\abhay\\\\Desktop\\\\Shivalaya Panache Menu\\\\apps\\\\customer-menu\\\\src\\\\hooks\\\\useMenu.js'
with open(use_menu_path, 'r') as f:
    content = f.read()

def replacer(m):
    return 'const mockData = ' + mock_data_str + ';'

content = re.sub(r'const mockData = \[.*?\];', replacer, content, flags=re.DOTALL)

with open(use_menu_path, 'w') as f:
    f.write(content)

print(f"Successfully added {len(mock_data)} items to mock data.")
