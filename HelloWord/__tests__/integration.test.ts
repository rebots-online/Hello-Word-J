import fs from 'fs';
import path from 'path';

test('reads fixture and passes', () => {
  const fixturePath = path.join(__dirname, 'fixtures', '200-lines.json');
  const data = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  expect(Array.isArray(data)).toBe(true);
  expect(true).toBe(true);
});
