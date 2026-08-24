# AGENTS.md - 项目约定和规则

## 项目信息

- **项目名称**：企业资产管理系统（Asset Management System）
- **技术栈**：React 18 + Create React App + Tailwind CSS
- **主要文件**：src/pages/yewurules.js（后台基础配置 + 业务视图）

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

**表格状态列必须使用 `<StatusTag />`**：
```jsx
<StatusTag value={val} />          // 是/否
<StatusTag value={val} type="enabled" />  // 启用/停用
<StatusTag value={val} type="stop" />     // 停产/未停产
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
<StatusTag value={val} />            // 是/否（绿色/灰色）
<StatusTag value={val} type="enabled" />  // 启用/停用（绿色/红色）
<StatusTag value={val} type="stop" />     // 停产/未停产（橙色/灰色）
```

  - 空值显示 `-`
  - `value` 兼容 `'1'`、`true`、`'是'`
## 关键设计决策

### 1. 弹窗选择组件
系统使用统一的弹窗选择组件来处理所有需要从列表中选择数据的场景。

**交互模式**：
- 点击输入框的任何位置都会弹出选择弹窗
- 输入框设置为 `readOnly`（防止直接编辑）
- 使用 `pointer-events-none` 让点击事件穿透到父容器
- 父容器添加 `cursor-pointer` 和 `onClick` 事件

**示例**：

**原位替换弹窗（替代嵌套弹窗）**：
- 适合"列表→选择"两步操作，不需要两层 Modal 堆叠
- 用 `roleView` 状态控制当前显示视图（如 `'list'` / `'select'`）
- 底部按钮栏统一用 `<div className="flex justify-center gap-3 mt-6">`，无 `border-t` / `pt-4` 装饰
- 按钮用 `className="px-6"`，主按钮 `type="primary"` / 次按钮 `type="default"`
- 新增时只添加 `ArrowLeft` 返回链接（可选），不保留"返回列表"和"取消"两个重复按钮
```jsx
<div className="w-[35%] p-2 flex items-center relative cursor-pointer" onClick={() => setIsModalOpen(true)}>
  <AntInput value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="请选择品牌" readOnly className="pointer-events-none" />
  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1677ff] pointer-events-none" />
</div>
```

### 2. 菜单结构
系统采用侧边栏菜单结构，当前一级菜单：
- **后台基础配置**：包含 13 个子菜单（业务基础数据维护、业务映射规则管理、组织与用户管理等）
- 其余为独立一级菜单（个人工作台、资产管理、无形资产、资产盘点）

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

### 5. 页面级操作按钮位置
- **页面级操作**（例如保存、提交、确认、返回、生成等对整页生效的动作）统一放在页面内容底部居中，使用 `flex justify-center gap-3`。
- 返回按钮属于页面级操作，不放在 Card 标题栏、表格工具栏或查询区。
- **分区级操作**（例如表格导出、删除所选、增行、局部查询/重置）继续放在对应 Card 或表格分区内，不与页面级操作混排。
- 页面存在多个页面级操作时，主操作使用 Antd `type="primary"`，其余按语义使用默认或危险按钮，整体保持底部居中排列。

### 6. 数字展示规范
- 数量、件数、条数、资产总量、盘点数量等计数型数字，展示时统一使用千分位，例如 `51,611`。
- 原值、净值、EBS 原值、金额等财务数字统一使用会计展示格式：千分位 + 2 位小数，例如 `1,250,000.00`。
- 百分比继续使用百分比格式，不强制补千分位；日期、编号、标签号、序列号、员工编号等标识类数字禁止套用千分位。
- 表格、Statistic、详情字段、汇总卡片和导出前的页面展示均遵守同一套数字口径；新增页面时不得直接裸展示大额数量或金额。

## 开发流程

### 1. 新增页面
1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/config/routes.js` 中添加路由配置
3. 在 `src/pages/yewurules.js` 中添加菜单和标签页

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
3. **禁止在 AGENTS.md 中添加历史叙事**——只添加项目约定和规则
4. **禁止在 docs/ 中添加"我记得上次……"**——这是记忆的事

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
- MEMORY.md - Agent记忆索引

## 版本信息

- 创建日期：2026-06-04
- 最后更新：2026-06-04
