# Context

## 当前状态
yewurules.js 已完成大规模组件化重构。原型标注层已搭好，yewurules.js「物料综合集合」已试点。

## 已完成改造
- 自定义组件替换为 Antd 原生（Select/Input/Table/Button/Radio/Modal）
- StatusTag 统一表格状态列显示
- SelectModal 通用选择弹窗替换 7 个内联弹窗
- Mock 数据拆到 businessRulesMock.js
- QueryBar 统一从组件文件引入，查询项使用 QueryItem
- 表格统一加 rowKey/scroll/pagination（33处）
- Button 写法修正（type="danger" → danger，27处）
- SelectModal 回调兼容 onConfirm/onSelect
- SelectModal 初始搜索值同步（useEffect）
- 查询区 Select 宽度修复 + placeholder/allowClear
- Select onChange 参数修正（e.target.value → value，43处）
- 标签加 shrink-0（52处）
- 删除重复 Pagination（33处）
- Modal 加 footer={null} 防双底部按钮（39处）
- SelectModal 默认值改为模块常量
- QueryBar 加默认查询/重置按钮
- Table 加 rowSelection + 批量按钮禁用（28视图）
- 内联 const data = [...] 改为 mock 变量（34处）
- StatusTag 加空值处理 + stop 类型改进
- 闭标签修复（271处）
- setter 名修正 isset→setIs（30处）


## 待办
- SelectModal 可用 Antd Modal+Table+Input 重写（当前是手写HTML）
- 弹窗表单可抽 FormSection/FormCell 组件
- QueryBar 支持查询/重置回调绑定

## 标注层
- 模块：src/prototype-annotations/（annotation-data.js + Layer + Panel + hook）
- 锚点：data-prototype-anchor="xxx" 打在页面元素上
- 页签过滤：visibleAnnotations 从 hotspots 用 useMemo 推导，不以独立 state 维护
- 关闭清理：toggle() 里主动移除 .paf-target-highlight 防高亮残留
- 入口：App.js 的 BrowserRouter 内挂 <PrototypeAnnotationLayer />

## 关键决定
- SelectModal 优先支持 onConfirm，兼容 onSelect（而非统一成一种）
- QueryBar exports QueryItem, avoids CSS selector-based styling
- StatusTag stop 类型假值显示"未停产"而非"否"
- 已废弃 AntButton/AntInput/AntSelect/AntTable 自定义组件