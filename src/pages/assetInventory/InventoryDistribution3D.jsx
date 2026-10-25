import React, { useId } from 'react';
import { distributionPercent } from '../../services/inventoryReportFormats';
import { buildExtrudedPie } from './inventoryPieGeometry';

export default function InventoryDistribution3D({ rows }) {
  const id = useId().replace(/:/g, '');
  const sectors = buildExtrudedPie(rows, { cx: 500, cy: 255, rx: 240, ry: 130 });
  const labels = sectors.map(row => {
    const sine = Math.sin(row.mid);
    const region = sine < -0.65 ? 'top' : sine > 0.65 ? 'bottom' : Math.cos(row.mid) >= 0 ? 'right' : 'left';
    // 前半圆的标签从可见侧壁下缘引出，避免引导线穿过顶面或百分比。
    const start = [row.edge[0], row.edge[1] + (sine > 0 ? 44 : 0)];
    return { ...row, region, start };
  });
  ['top', 'bottom'].forEach(region => {
    const group = labels.filter(row => row.region === region).sort((a, b) => a.start[0] - b.start[0]);
    group.forEach((row, index) => {
      const middle = group.reduce((sum, item) => sum + item.start[0], 0) / group.length;
      row.x = Math.max(290, Math.min(760, middle + (index - (group.length - 1) / 2) * 210));
      row.y = region === 'top' ? 30 : 485;
      row.anchor = 'middle';
      const bend = [row.start[0] + 16 * Math.cos(row.mid), row.start[1] + 20 * Math.sin(row.mid)];
      row.points = [row.start, bend, [row.x, region === 'top' ? 64 : 463]];
    });
  });
  ['left', 'right'].forEach(region => {
    const group = labels.filter(row => row.region === region).sort((a, b) => a.start[1] - b.start[1]);
    let previous = 100;
    group.forEach(row => {
      row.x = region === 'left' ? 212 : 810;
      row.y = Math.max(row.start[1] - 10, previous + 68);
      previous = row.y;
      row.anchor = region === 'left' ? 'end' : 'start';
      const bendX = region === 'left' ? 232 : 785;
      row.points = [row.start, [bendX, row.start[1]], [bendX, row.y + 8], [row.x + (region === 'left' ? 10 : -10), row.y + 8]];
    });
  });
  return <svg role="img" aria-label="资产类型分布立体对比图" viewBox="0 0 1180 550" style={{ fontFamily: 'Noto Sans CJK SC, Noto Sans SC, Arial, sans-serif', width: '100%', height: 'auto', display: 'block', color: '#434343' }}>
    <defs>{sectors.map(row => <React.Fragment key={row.index}>
      <linearGradient id={`${id}-top-${row.index}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={row.fill} stopOpacity="0.8" /><stop offset="1" stopColor={row.fill} /></linearGradient>
      <linearGradient id={`${id}-side-${row.index}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={row.fill} /><stop offset="1" stopColor="#171d29" /></linearGradient>
    </React.Fragment>)}</defs>
    {/* 深度层先绘，顶面后绘，分离间隙保留白底。 */}
    {sectors.map(row => <g key={`side-${row.index}`} fill={`url(#${id}-side-${row.index})`}><path d={row.startWall} /><path d={row.endWall} />{row.wall && <path d={row.wall} />}</g>)}
    {sectors.map(row => <g key={row.index}>
      <path d={row.top} fill={`url(#${id}-top-${row.index})`} stroke="#fff" strokeWidth="1"><title>{`${row.category}：${Math.round(row.original / 10000)}万元，${Math.round(row.quantity)}${row.quantityUnit || ''}，${distributionPercent(row.fraction)}`}</title></path>
      <text x={row.label[0]} y={row.label[1]} fill="#fff" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="600">{distributionPercent(row.fraction)}</text>
    </g>)}
    {labels.map(row => <g key={`label-${row.index}`}>
      <polyline points={row.points.map(point => point.join(',')).join(' ')} fill="none" stroke="#9aa3af" strokeWidth="1.25" strokeLinejoin="round" />
      <text x={row.x} y={row.y} textAnchor={row.anchor} fontSize="14">
        <tspan x={row.x}>{row.category}</tspan><tspan x={row.x} dy="21">{`${Math.round(row.original / 10000)}万元(${Math.round(row.quantity)}${row.quantityUnit || ''})`}</tspan>
      </text>
    </g>)}
    <g transform="translate(1005,115)">{sectors.map((row, index) => <g key={row.index} transform={`translate(0,${index * 36})`}>
      <rect width="13" height="13" rx="2" fill={row.fill} /><text x="22" y="11" fontSize="13">{row.category}</text>
    </g>)}</g>
  </svg>;
}
