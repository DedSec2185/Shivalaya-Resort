const fs = require('fs');

const seedSql = fs.readFileSync('C:\\\\Users\\\\abhay\\\\Desktop\\\\Shivalaya Panache Menu\\\\supabase\\\\seed.sql', 'utf8');
const lines = seedSql.split('\\n');

let mockData = [];
let idCounter = 1;

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('((SELECT id')) {
    // line is: ((SELECT id FROM restaurants WHERE slug = 'panache-shivalaya'), 'Breakfast', 'Cereals with Milk', 160, true, 1),
    // Or ending with ;
    
    // Split by ', '
    const parts = line.split(', \\'');
    if (parts.length >= 3) {
      const sectionStr = parts[1]; // "Breakfast'"
      const section = sectionStr.substring(0, sectionStr.length - 1); // remove trailing quote
      
      const rest = parts[2].split('\\', ');
      const name = rest[0]; // "Cereals with Milk"
      
      const trailing = rest[1].split(', ');
      // trailing: [ "", "160", "true", "1)," ]
      const price = parseInt(trailing[1], 10);
      const veg = trailing[2] === 'true';
      const sortOrder = parseInt(trailing[3], 10);
      
      mockData.push({
        id: String(idCounter++),
        section,
        name,
        price,
        veg,
        available: true,
        sort_order: sortOrder
      });
    }
  }
}

const mockDataStr = JSON.stringify(mockData, null, 2);

const useMenuPath = 'C:\\\\Users\\\\abhay\\\\Desktop\\\\Shivalaya Panache Menu\\\\apps\\\\customer-menu\\\\src\\\\hooks\\\\useMenu.js';
let useMenuCode = fs.readFileSync(useMenuPath, 'utf8');

useMenuCode = useMenuCode.replace(
  /const mockData = \\[[\\s\\S]*?\\];/,
  'const mockData = ' + mockDataStr + ';'
);

fs.writeFileSync(useMenuPath, useMenuCode);
console.log('Successfully added ' + mockData.length + ' items to mock data.');
