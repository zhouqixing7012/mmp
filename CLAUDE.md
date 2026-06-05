# CLAUDE.md - 项目约定和规则

## 项目信息

- **项目名称**：企业资产管理系统（Asset Management System）
- **技术栈**：React 18 + Create React App + Tailwind CSS
- **主要文件**：src/pages/yewurules.js（业务规则管理）

## 代码规范

### 0. 组件使用规则（必须遵守）

**禁止自己写按钮/输入框样式，必须使用已有的统一组件**

✅ **正确做法**：
```jsx
<AntButton type="primary" icon={<Plus size={14} />}>新增</AntButton>
<AntButton type="default" className="text-green-600" icon={<CheckCircle size={14} />}>启用</AntButton>
<AntButton type="danger" icon={<XCircle size={14} />}>停用</AntButton>
```

❌ **禁止这样做**：
```jsx
<button className="px-4 py-1.5 bg-[#1677ff] hover:bg-blue-500 text-white text-sm rounded shadow-sm flex items-center">
  <Plus size={14} className="mr-1" /> 新增
</button>
```

**已有统一组件**：
- `AntButton`（按钮，支持 type: primary/default/danger/dashed/link）
- `AntInput`（输入框）
- `AntSelect`（下拉选择）
- `AntModal`（弹窗）
- `AntTable`（表格）

**新增按钮时的规则**：
- 主要操作（新增、查询、保存）：`type="primary"`
- 次要操作（导出）：`type="default"`
- 危险操作（停用、删除）：`type="danger"`
- 操作列编辑：`type="link"`
- 启用按钮：`type="default" className="text-green-600" icon={<CheckCircle size={14} />}`
- 批量操作：`type="default" icon={<Edit size={14} />}`
- 批量删除：`type="default" icon={<Trash2 size={14} />}`

### 1. 文件组织
- 页面组件放在 `src/pages/` 目录下
- 通用组件放在 `src/components/` 目录下
- 配置文件放在 `src/config/` 目录下
- 文档放在 `docs/` 目录下

### 2. 组件命名
- 页面组件使用 PascalCase（如 `MaterialCategoryView`）
- 弹窗选择组件使用 PascalCase + Modal 后缀（如 `BrandSelectModal`）
- 通用组件使用 PascalCase（如 `AntButton`）

### 3. 样式规范
- 使用 Tailwind CSS 进行样式编写
- 遵循 Antd 设计风格
- 使用语义化的颜色 token

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
系统采用侧边栏菜单结构，主要分为：
- **业务配置**：包含多个子菜单（物料基础数据维护、业务映射规则管理等）
- **系统配置**：组织与用户管理

**菜单状态管理**：
- `activeMenu`：当前活动的一级菜单（如 '业务配置'、'系统配置'）
- `activeSubMenu`：当前活动的二级菜单（如 '物料大类'、'组织与用户管理'）
- `activeTab`：当前活动的标签页

### 3. 组件复用
系统大量使用可复用组件，包括：
- `AntButton`（按钮组件）
- `AntInput`（输入框组件）
- `AntSelect`（下拉选择组件）
- `AntRadio`（单选按钮组件）
- `AntModal`（弹窗组件）
- `AntTable`（表格组件）
- `QueryBar`（查询栏组件）

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
3. **禁止在 CLAUDE.md 中添加历史叙事**——只添加项目约定和规则
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
