const point = (cx, cy, rx, ry, angle) => [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
const pair = p => p.map(value => Number(value.toFixed(3))).join(',');
// 真实金额决定角度；椭圆投影、厚度和外移只改变视觉，不改变占比。
export function buildExtrudedPie(rows, { cx = 420, cy = 245, rx = 265, ry = 142, depth = 44, explode = 12 } = {}) {
  const total = rows.reduce((sum, row) => sum + Math.max(0, row.original || 0), 0);
  let start = -Math.PI / 2;
  return rows.filter(row => row.original > 0).map((row, index) => {
    const span = row.original / total * Math.PI * 2;
    const end = start + span;
    const mid = (start + end) / 2;
    const x = cx + Math.cos(mid) * explode;
    const y = cy + Math.sin(mid) * explode * ry / rx;
    const a = point(x, y, rx, ry, start);
    const b = point(x, y, rx, ry, end);
    const large = span > Math.PI ? 1 : 0;
    const top = `M${x},${y} L${pair(a)} A${rx},${ry} 0 ${large} 1 ${pair(b)} Z`;
    // 只绘制朝向观察者的下半椭圆外壁，背面不穿透顶面。
    const frontStart = Math.max(start, 0);
    const frontEnd = Math.min(end, Math.PI);
    let wall = '';
    if (frontEnd > frontStart) {
      const f = point(x, y, rx, ry, frontStart);
      const t = point(x, y, rx, ry, frontEnd);
      wall = `M${pair(f)} A${rx},${ry} 0 0 1 ${pair(t)} L${pair([t[0], t[1] + depth])} A${rx},${ry} 0 0 0 ${pair([f[0], f[1] + depth])} Z`;
    }
    const radial = (p) => `M${x},${y} L${pair(p)} L${pair([p[0], p[1] + depth])} L${x},${y + depth} Z`;
    const result = { ...row, index, fraction: row.original / total, mid, top, wall, startWall: radial(a), endWall: radial(b), label: point(x, y, rx * 0.62, ry * 0.62, mid), edge: point(x, y, rx, ry, mid) };
    start = end;
    return result;
  });
}
