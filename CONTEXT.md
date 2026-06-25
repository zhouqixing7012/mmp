# Context

## 当前状态
yewurules.js 已完成大规模组件化重构。原型标注层已搭好，yewurules.js「物料综合集合」已试点。

## 已完成改造
- 物料维度组合新增弹窗字段重构：维度组合描述自动生成（品牌.型号）、物料大类/小类合并为弹窗选择、品牌/规格型号合并为弹窗选择
- 状态字段改为4项：是否启用、启用日期、停用日期、是否停产
- 权限控制字段改为5项单选按钮：正式员工可申请（全部/技术/非技术）、实习生可申请、是否允许更换、是否允许转移、是否允许退库
- 业务规则字段改为7项条件显示字段：级别、是否需要盘点、是否关联主资产、耗材申请是否需要MIS审核、主资产物料小类、退库是否需要MIS鉴定、非技术申请超标
- 单位移入核心字段
- 资产/耗材/低值耐用品专属字段合并到业务规则条件显示
- 新增物料小类选择弹窗及状态 isSubCategoryModalOpen
- DatePicker 加入 Antd 导入
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
- 维度组合描述自动生成为品牌.型号格式，与维度组合编码的系统自动生成逻辑一致
- 权限控制统一使用 Radio.Group + Radio 代替 Select 下拉框
- 业务规则字段条件显示按物料总类分类（资产/耗材/低值耐用品），避免独立的专属字段区域
- QueryBar exports QueryItem, avoids CSS selector-based styling
- StatusTag stop 类型假值显示"未停产"而非"否"
- 已废弃 AntButton/AntInput/AntSelect/AntTable 自定义组件

## 2026-06-25 会话备注
- 本次会话（2026-06-24/25）对 yewurules.js 做了大量改动（见 ROLLBACK_WARNING.md），
  中途被另一对话误回滚，部分改动丢失
- **已存活**：DatePicker import、维度组合描述自动生成、参考价格、启用日期/停用日期
- **已丢失**：物料大类/小类合并、品牌/规格型号合并、权限控制字段重构、业务规则数据驱动重构、
  仓库弹窗样式统一、地点操作栏隐藏等（完整清单见 ROLLBACK_WARNING.md）
- **防止再次回滚**：详见 ROLLBACK_WARNING.md，回滚前先 git diff HEAD 确认范围
