function labelText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(labelText).join('');
  return value?.props ? labelText(value.props.children) : '';
}

// Classification uses column semantics, never the value of a record (numeric identifiers remain identifiers).
export function columnAlignment(column) {
  if (column.children?.length) return 'center';
  const title = labelText(column.title).replace(/\s+/g, '');
  const key = Array.isArray(column.dataIndex) ? column.dataIndex.at(-1) : column.dataIndex || column.key || '';
  if (title === '行号' && /^(lineNo|lineNumber|poLine|applicationLine)$/i.test(key)) return 'left';
  const type = column.alignmentType || column.sizing?.type || column.format;
  if (/^(序号|行号|Excel行号|No\.?|序列|#)$/i.test(title) || type === 'index') return 'center';
  if (/编号|编码|标签号|单号|序列号|工号|账号|账户|手机号|电话|SN|IP地址|PR单.*行|SA单.*行|PO.*行号|明细.*号/i.test(title)) return 'left';
  if (/名称$|描述$|说明$|备注$|原因$|意见$|类型$|^目标价值$|^业务价值$/.test(title)) return 'left';
  if (/状态|^是否|^操作$|^查看$|^选择$|^启用$|^可借用$|^进度查看$/.test(title) || ['status', 'boolean', 'action'].includes(type)) return 'center';
  if (/日期|时间|^年度$|^年份$|^盘点年份$/.test(title) || ['date', 'datetime', 'year'].includes(type)) return 'center';
  if (['number', 'money', 'percent', 'amount', 'quantity'].includes(type) || /数量|金额|单价|净值|原值|总量|总额|价值|占比|增长率|百分比|赔偿|人均|寿命|年限|天数|次数|费用|价格|折旧|增长量|份数|税金|小计|税率|税额|比率|比例|完成率|使用率|条数|行数|笔数|总数|人数/.test(title)) return 'right';
  if (/名称|描述|说明|备注|原因|意见|姓名|部门|公司|仓库|配置|地址|地点|城市|楼层|用途|类别|类型|品牌|型号|单位/.test(title) && !/金额|单价|数量|净值|原值|总量|总额|价值/.test(title)) return 'left';
  if (/^(index|rowIndex|rowNo|sequence)$/i.test(key)) return 'center';
  if (/^(action|actions|operation|progress|status|enabled|borrowable|selected)$/i.test(key)) return 'center';
  if (/(At|Date|Time)$/.test(key)) return 'center';
  if (/(Quantity|Amount|Price|Count|Rate|Percent|Net|Original)$/.test(key) || /^(quantity|qty|amount|price|count|rate|percent|net|original)$/i.test(key)) return 'right';
  return 'left';
}

export function alignTableColumns(columns, preserve = false) {
  if (!columns || preserve) return columns;
  return columns.map(column => {
    if (typeof column !== 'object' || column === null || !Object.keys(column).length) return column;
    const align = columnAlignment(column);
    return { ...column, align, className: `${column.className || ''} mmp-table-cell-${align}`.trim(),
      ...(column.children ? { children: alignTableColumns(column.children) } : {}),
      onCell: (...args) => {
        const cell = column.onCell?.(...args) || {};
        return { ...cell, style: { ...cell.style, textAlign: align } };
      },
      onHeaderCell: (...args) => {
        const cell = column.onHeaderCell?.(...args) || {};
        return { ...cell, style: { ...cell.style, textAlign: align } };
      },
    };
  });
}
