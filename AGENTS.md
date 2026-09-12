# AGENTS.md - 项目约定和规则

## 项目信息

- **项目名称**：企业资产管理系统（Asset Management System）
- **技术栈**：React 19 + Create React App + Ant Design 6 + Tailwind CSS
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

### 7. 统一动效规范（必须遵守）

完整规范见 `docs/UI_MOTION_GUIDELINES.md`。新增页面和修改交互时必须先复用现有公共动效，不得自行发明动画参数。

**固定规则**：
- `/yewurules` 的菜单 / 子菜单 / Tab 切换，以及同一菜单内列表 / 详情 / 编辑 / 创建视图替换，默认由 `AdminContent + PageMotionBoundary` 统一处理，业务页禁止再叠加同层整页进入动画。
- 普通 React Router 路由切换及其同 URL 内的语义视图替换，由 `src/App.js + PageMotionBoundary` 统一处理；无论 `Link` 还是按钮内 `navigate()`，业务页面都不得再单独写一套路由切换动画。
- `PageMotionBoundary` 会同时根据页面 `h1/h2/h3/h4`、主要 `Card` 标题变化，以及页面出口第一层 Card/Table/Form/Descriptions 等主要业务区块替换识别内部整页视图切换；表格行更新、输入值变化、局部提示/按钮显隐不会触发整页动画。
- Modal / Drawer / Popover / Dropdown 及项目自定义弹窗内部标题和结构必须被排除，打开浮层不能触发整页页面动效。
- 如果两个内部视图既没有可区分标题、也没有可识别的主要业务区块替换，必须在当前视图根节点提供 `data-page-view-key="..."`，或使用 `src/components/PageViewMotion.jsx` 显式声明 `viewKey` 作为兜底。
- 选择弹窗继续使用 `<SelectModal />`；普通弹窗优先使用 Ant Design `Modal`，已有自定义场景复用 `src/components/Modal.js`。
- 明确可点击的卡片/操作块使用 `mmp-interactive-card`；查询 Card、详情 Card、表格 Card 等纯信息容器保持静止。
- 新增/修改后需要回列表定位结果时，使用 `useTransientRowHighlight`，成功落数据后调用 `highlightRow(key)`，Table 用 `rowClassName` 接入。
- 侧边栏展开使用 `mmp-sidebar-collapse`，自定义顶部轻量下拉使用 `mmp-nav-dropdown`；优先使用 Ant Design Dropdown/Popover。
- 禁止业务页面自行写 300ms 以上常规动画、明显 bounce/spring、大距离飞入。
- 禁止为简单动效引入新的动画依赖。
- 避免 `transition-all`；只过渡真实需要变化的 `color / background-color / opacity / transform / box-shadow / border-color`。
- 所有新增动效必须尊重 `prefers-reduced-motion`。

**同 URL 特殊视图兜底示例**：
```jsx
<div data-page-view-key={view}>
  {view === 'list' ? <ListView /> : <EditorView />}
</div>

<PageViewMotion viewKey={view}>
  {view === 'list' ? <ListView /> : <EditorView />}
</PageViewMotion>
```

**表格结果反馈示例**：
```jsx
import useTransientRowHighlight from '../hooks/useTransientRowHighlight';

const { highlightRow, getRowClassName } = useTransientRowHighlight();

<Table
  rowKey="id"
  rowClassName={(record) => getRowClassName(record, 'id')}
/>

// 新增/修改真正成功后调用
highlightRow(record.id);
```

## 开发流程

### 1. 新增页面
1. 在 `src/pages/` 目录下创建新的页面组件
2. 在 `src/config/routes.js` 中添加路由配置
3. 在 `src/pages/yewurules.js` 中添加菜单和标签页
4. 页面默认复用 `PageMotionBoundary` 自动识别列表 / 详情 / 编辑 / 创建切换；只有自动识别确实无法区分时才补 `data-page-view-key` 或 `PageViewMotion`
5. 按 `docs/UI_MOTION_GUIDELINES.md` 检查页面切换、弹窗、可点击 Card、菜单/下拉、表格结果反馈和 reduced motion；不得为新页面另起一套动效

### 2. 新增弹窗选择功能
1. 创建对应的弹窗选择组件（如 `BrandSelectModal`）
2. 在页面组件中添加状态（如 `isBrandModalOpen`）
3. 修改字段为弹窗选择（使用 `readOnly` 和 `pointer-events-none`）
4. 在页面组件中添加弹窗选择组件

### 3. 修改现有字段
1. 如果需要将现有字段改为弹窗选择，按照第2步操作
2. 确保所有弹窗选择字段都遵循统一的交互模式

### 4. 原型变更与文档同步

原型中已经由用户明确确认并落地的变化，不能只改代码和 `CONTEXT.md`。完成实现后按变化类型同步：

- 字段增删、改名、顺序、整行/跨列、查询条件、弹窗字段 → 对应当前实现 PRD。
- 固定提示、确认文案、保管职责、审批/办理动作、流程节点 → 对应业务 PRD。
- 可复用的 UI/布局/数据口径经验 → `lessons.md`、`AI_RULES.md` 或 UI 规范中的合适位置。
- 当前实现状态 → `CONTEXT.md`。

`docs/员工自助功能PRD/00～11` 是来源 PDF 拆分文档，默认保留原文用于溯源；后续原型覆盖统一记录在 `docs/员工自助功能PRD/12-当前原型补充口径.md`，不要为了追平原型直接篡改来源 PDF 原文。

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
- docs/UI_DESIGN_GUIDELINES.md - UI 设计规范
- docs/UI_MOTION_GUIDELINES.md - B 端统一动效规范
- docs/PRD-*.md - 产品需求文档
- docs/员工自助功能PRD/12-当前原型补充口径.md - 来源 PDF 后续原型覆盖口径
- MEMORY.md - Agent记忆索引

## 版本信息

- 创建日期：2026-06-04
- 最后更新：2026-09-12
