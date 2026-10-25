import React, { useId } from 'react';
import { distributionPercent } from '../../services/inventoryReportFormats';
import { buildExtrudedPie } from './inventoryPieGeometry';

export default function InventoryDistribution3D({ rows }) {
  const id = useId().replace(/:/g, '');
  const sectors = buildExtrudedPie(rows);
  const labelRows = [...sectors].sort((a, b) => a.edge[1] - b.edge[1]);
  // 左右分别排标签，保证图中文字不会因小扇区聚集而重叠。
  const labelY = {};
  [true, false].forEach(right => {
    const side = labelRows.filter(row => (Math.cos(row.mid) >= 0) === right);
    let previous = 28;
    side.forEach(row => { labelY[row.index] = Math.max(previous + 58, Math.min(420, row.edge[1])); previous = labelY[row.index]; });
    const overflow = Math.max(0, previous - 430);
    side.forEach(row => { labelY[row.index] -= overflow; });
  });
  return <svg role="img" aria-label="资产类型分布立体对比图" viewBox="0 0 1180 520" style={{ fontFamily: 'Noto Sans CJK SC, Noto Sans SC, Arial, sans-serif', width: '100%', height: 'auto', display: 'block', color: '#434343' }}>
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
    {sectors.map(row => {
      const right = Math.cos(row.mid) >= 0;
      const x = right ? 750 : 160;
      const y = labelY[row.index];
      const elbow = right ? 720 : 180;
      const outward = [row.edge[0] + 24 * Math.cos(row.mid), row.edge[1] + 18 * Math.sin(row.mid)];
      return <g key={`label-${row.index}`}>
        <polyline points={`${row.edge[0]},${row.edge[1]} ${outward[0]},${outward[1]} ${elbow},${y} ${x},${y}`} fill="none" stroke="#aeb4be" strokeWidth="1.5" />
        <text x={x} y={y - 9} textAnchor={right ? 'start' : 'end'} fontSize="14">
          <tspan x={x}>{row.category}</tspan><tspan x={x} dy="21">{`${Math.round(row.original / 10000)}万元(${Math.round(row.quantity)}${row.quantityUnit || ''})`}</tspan>
        </text>
      </g>;
    })}
    <g transform="translate(1005,115)">{sectors.map((row, index) => <g key={row.index} transform={`translate(0,${index * 36})`}>
      <rect width="13" height="13" rx="2" fill={row.fill} /><text x="22" y="11" fontSize="13">{row.category}</text>
    </g>)}</g>
  </svg>;
}
