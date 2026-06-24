// 业务规则编辑页 (yewurules) 的标注数据
// 每个标注对应页面上一个 data-prototype-anchor 元素

const yewurulesAnnotations = [
  // ---- 物料综合集合 ----
  {
    id: "material-query-bar",
    pageKey: "yewurules",
    target: "material-query-bar",
    context: { state: "物料维度组合" },
    kind: "module",
    title: "查询筛选区",
    summary: "用于按条件过滤物料维度组合列表。支持编码、描述、物资总类、大类、小类、单位、启用状态、参考价格等维度查询。",
    summarySource: "observed",
    sections: [
      {
        title: "字段说明",
        items: [
          { text: "维度组合编码：系统自动生成的唯一编码，支持模糊搜索。", source: "observed" },
          { text: "物资总类：分类选项包括资产(1)、低值耐用品(2)。", source: "observed" },
          { text: "是否启用：筛选启用(1)或停用(0)的维度组合。", source: "observed" },
          { text: "参考价格：数值范围筛选，支持从-至区间查询。", source: "observed" },
        ],
      },
      {
        title: "操作规则",
        items: [
          { text: "修改任一筛选条件后，需点击查询按钮触发列表刷新。", source: "inferred" },
          { text: "点击重置按钮恢复所有筛选条件为默认值。", source: "inferred" },
        ],
      },
    ],
  },
  {
    id: "material-table-toolbar",
    pageKey: "yewurules",
    target: "material-table-toolbar",
    context: { state: "物料维度组合" },
    kind: "module",
    title: "表格操作栏",
    summary: "提供对物料维度组合数据的批量操作和新增功能。",
    summarySource: "observed",
    sections: [
      {
        title: "按钮说明",
        items: [
          { text: "新增：打开新增物料维度组合弹窗，表单含核心字段、状态字段、业务规则字段三组。", source: "observed" },
          { text: "删除：批量删除勾选的维度组合记录，未勾选时按钮禁用。", source: "observed" },
          { text: "启用：批量将勾选记录的启用状态设为启用。", source: "observed" },
          { text: "停用：批量将勾选记录的启用状态设为停用。", source: "observed" },
          { text: "批量修改：打开批量修改弹窗，可同时更新多条记录的同名字段。", source: "observed" },
        ],
      },
      {
        title: "阻断条件",
        items: [
          { text: "删除、启用、停用按钮依赖表格勾选，无勾选时不可操作。", source: "observed" },
        ],
      },
    ],
  },
  {
    id: "material-table",
    pageKey: "yewurules",
    target: "material-table",
    context: { state: "物料维度组合" },
    kind: "module",
    title: "物料维度组合列表",
    summary: "展示所有物料维度组合记录，含编码、描述、分类、品牌、型号、配置、单位、状态标记、价格、操作等信息。",
    summarySource: "observed",
    sections: [
      {
        title: "表格概览",
        items: [
          { text: "共 20+ 列数据，支持横向滚动查看全部列。", source: "observed" },
          { text: "每页默认 10 条，支持切换每页条数，底部显示总条数。", source: "observed" },
          { text: "首列为复选框，支持多选后批量操作。", source: "observed" },
        ],
      },
      {
        title: "状态列说明",
        items: [
          { text: "是否启用：绿色标签=启用，红色标签=停用。", source: "observed" },
          { text: "是否停产：绿色=未停产，红色=已停产。", source: "observed" },
          { text: "是否有级别、是否关联主资产 等布尔列统一用 StatusTag 展示是/否。", source: "observed" },
        ],
      },
    ],
  },
];

export default yewurulesAnnotations;
