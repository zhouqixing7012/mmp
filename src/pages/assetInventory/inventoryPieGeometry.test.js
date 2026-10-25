import { buildExtrudedPie } from './inventoryPieGeometry';
test('立体投影沿用真实金额占比和原始数据，跳过零扇区', () => {
  const rows = [{ category: 'A', original: 3, quantity: 2 }, { category: 'B', original: 1, quantity: 9 }, { category: '零', original: 0 }];
  const slices = buildExtrudedPie(rows);
  expect(slices.map(row => row.fraction)).toEqual([0.75, 0.25]);
  expect(slices[0].quantity).toBe(2);
  expect(slices[0].top).toContain('A265,142');
  expect(slices[0].wall).not.toBe('');
  expect(rows[0]).not.toHaveProperty('fraction');
  expect(buildExtrudedPie([])).toEqual([]);
});
