# CLAUDE.md - 项目约定和规则

## 项目信息

- **项目名称**：企业资产管理系统（Asset Management System）
- **技术栈**：React 19 + Create React App + Tailwind CSS
- **主要文件**：src/pages/yewurules.js（后台基础配置 + 业务视图）
- **个人工作台 UI 规范**：`docs/UI_DESIGN_GUIDELINES.md`

## 代码规范

### 0. 组件使用规则（必须遵守）

**禁止自己写按钮/输入框样式，必须使用 Antd 原生组件**

✅ **正确做法**：
```jsx
<Button type="primary" icon={<Plus size={14} />}>新增</Button>
<Button danger icon={<Trash2 size={14} />}>删除</Button>
<Input placeholder="请输入编码" />
<Select
  style={{ width: '100%' }}
  placeholder="请选择"
  allowClear
  options={[{ label: '是', value: '1' }]}
/>
```

工具按钮（新增、搜索、上传、删除、刷新）可以使用图标；提交、同意、驳回、确认、取消、返回、加签、转签等业务流程按钮统一不带图标。

**表格状态列必须使用 `<StatusTag />`**：
```jsx
<StatusTag value={val} />                 // 是/否
<StatusTag value={val} type="enabled" /> // 启用/停用
<StatusTag value={val} type="stop" />    // 停产/未停产
<StatusTag value={val} type="business" /> // 通用业务状态
```

**选择弹窗必须使用 `<SelectModal />`**：
```jsx
<SelectModal
  open={isOpen}
  title="选择品牌"
  dataSource={mockBrands}
  columns={[{ title: '编码', dataIndex: 'code' }, { title: '描述', dataIndex: 'desc' }]}
  searchFields={[{ label: '编码', name: 'code', dataIndex: 'code' }]}
  onCancel={() => setIsOpen(false)}
  onConfirm={(record) => { setField(record.desc); setIsOpen(false); }}
/>
```

**查询栏必须使用 `<QueryBar>` + `<QueryItem>`**：
```jsx
<QueryBar>
  <QueryItem label="字段名">
    <Input placeholder="..." />
  </QueryItem>
</QueryBar>
```

### 1. 状态组件（可沿用）

```jsx
<StatusTag value={val} />                 // 是/否（绿色/灰色）
<StatusTag value={val} type="enabled" /> // 启用/停用（绿色/红色）
<StatusTag value={val} type="stop" />    // 停产/未停产（橙色/灰色）
<StatusTag value={val} type="business" /> // 审批、资产、盘点等业务状态
```

- 空值显示 `-`
- `value` 兼容 `'1'`、true、`'是'`
- 页面不得自行维护状态颜色映射

### 2. 个人工作台详情页（必须遵守）

- 开发或修改个人工作台页面前，先阅读 `docs/UI_DESIGN_GUIDELINES.md`。
- 页面区块统一使用 `Card size="small"`，区块间距 16px。
- 详情默认使用 `Descriptions bordered size="small" column={3}`，长文本 `span={3}`。
- 申请日期和部门分别使用 `formatDateText`、`formatDepartment`。
- 只涉及固定资产时统一使用“资产”，同时存在耗材时才使用“物资”。
- 审批记录无真实代理数据时不得展示代理人列。
- 字段级查看入口使用小尺寸文字按钮，Card 右上角只放 Card 级操作。
- 弹窗只保留一个主标题，不增加重复二级标题。

## 关键设计决策

### 1. 弹窗选择组件
系统使用统一的弹窗选择组件来处理所有需要从列表中选择数据的场景。

**交互模式**：
- 点击输入框的任何位置都会弹出选择弹窗
- 输入框设置为 `readOnly`（防止直接编辑）
- 使用 `pointer-events-none` 让点击事件穿透到父容器
- 父容器添加 `cursor-pointer` 和 `onClick` 事件

**示例**：
```jsx
<div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsModalOpen(true)}>
  <AntInput value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="请选择品牌" readOnly className="pointer-events-none" />
  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
</div>
```

### 2. 菜单结构
系统采用侧边栏菜单结构，当前一级菜单：
- **后台基础配置**：包含 13 个子菜单（业务基础数据维护、业务映射规则管理、组织与用户管理等）
- **个人工作台**：可展开，含工作台首页、新增资产申请、资产申请审批、资产申请配给、号码管理、号码控制
- 其余为独立一级菜单（资产管理、无形资产、资产盘点）

**菜单状态管理**：
- `activeMenu`：当前活动的一级菜单（如 '后台基础配置'）
- `activeSubMenu`：当前活动的二级菜单（如 '物料大类'、'组织与用户管理'）
- `activeTab`：当前活动的标签页

### 3. 组件复用
系统大量使用可复用组件，包括：
- `AntButton`（按钮组件）
- `AntInput`（输入框组件，默认 `w-full` 填满父容器）
- `AntSelect`（下拉选择组件，`className` 作用于外层 div）
- `AntRadio`（单选按钮组件）
- `AntModal`（弹窗组件）
- `AntTable`（表格组件）

### 4. 查询条件布局（Grid 三列对齐）
所有页面的查询条件区域统一使用 CSS Grid 三列布局，确保标签和输入框跨行对齐。

**固定模式**：
```jsx
<div className="flex-1 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-6 gap-y-3 items-center">
  <div className="flex items-center justify-end gap-2">
    <span className="text-sm text-gray-600 whitespace-nowrap w-24 text-right">标签名:</span>
    <div className="flex-1"><AntInput placeholder="请输入..." /></div>
  </div>
  {/* AntSelect 同理，className="flex-1" */}
</div>
```

**关键规则**：
- 标签固定 `w-24 text-right whitespace-nowrap`（96px 右对齐）
- AntInput 包在 `<div className="flex-1">` 中（因 AntInput 自带 `w-full` 无法被 className 覆盖）
- AntSelect 使用 `className="flex-1"`（className 作用于外层 div，可正常覆盖）
- 每行最多 3 个条件，不足 3 个用空 `<div></div>` 补齐
- 查询/重置按钮在 grid 右侧，使用 `shrink-0`

## 开发流程

### 1. 新增页面
1. 阅读 `AI_RULES.md`、`CLAUDE.md` 和 `docs/UI_DESIGN_GUIDELINES.md`
2. 在 `src/pages/` 目录下创建新的页面组件
3. 在 `src/config/routes.js` 中添加路由配置
4. 在 `src/pages/yewurules.js` 中添加菜单和标签页
5. 按 UI 规范检查清单完成设计走查后再提交

### 2. 新增弹窗选择功能
1. 创建对应的弹窗选择组件（如 `BrandSelectModal`）
2. 在页面组件中添加状态（如 `isBrandModalOpen`）
3. 修改字段为弹窗选择（使用 `readOnly` 和 `pointer-events-none`）
4. 在页面组件中添加弹窗选择组件

### 3. 修改现有字段
1. 如果需要将现有字段改为弹窗选择，按照第2步操作
2. 确保所有弹窗选择字段都遵循统一的交互模式

## 禁止事项

1. **禁止使用正则表达式处理嵌套结构**（如 JSX、HTML、XML）——使用状态机解析器
2. **禁止在 disabled 的 input 上直接绑定 onClick 事件**——使用父容器的 onClick 事件
3. **禁止在 CLAUDE.md 中添加历史叙事**——只添加项目约定和规则
4. **禁止在 docs/ 中添加"我记得上次……"**——这是记忆的事
5. **禁止个人工作台页面自行定义状态颜色、部门格式或日期格式**
6. **禁止用自定义 section 模拟业务 Card**
7. **禁止在没有真实代理数据时展示代理人列**

## 常用命令

### 启动项目
```bash
npm start
```

### 构建生产版本
```bash
npm run build
```

### 运行测试
```bash
npm test
```

## 相关文档

- README.md - 项目说明和架构
- docs/PRD-*.md - 产品需求文档
- docs/UI_DESIGN_GUIDELINES.md - 个人工作台业务页面设计规范
- MEMORY.md - Agent记忆索引

## 版本信息

- 创建日期：2026-06-04
- 最后更新：2026-08-04
