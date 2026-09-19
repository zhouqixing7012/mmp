import fs from 'fs';
import path from 'path';

test('imports the asset management directory entry explicitly', () => {
  const source = fs.readFileSync(path.join(__dirname, 'pages/yewurules.js'), 'utf8');
  expect(source).toContain("from './assetManagement/index';");
});
