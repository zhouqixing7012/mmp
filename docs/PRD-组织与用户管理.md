# 组织与用户管理模块 PRD

**文档版本**：v1.0
**更新日期**：2026年6月4日

---

## 一、模块概述

### 1.1 模块定位

"组织与用户管理"是企业资产管理系统的**系统配置模块**，用于管理企业的组织结构和用户信息。该模块为系统中所有涉及部门、人员的功能提供基础数据支持。

### 1.2 包含页面

本模块包含2个子页面，通过顶部Tab标签页切换：

| Tab标签 | 页面名称 | 功能说明 |
|---------|----------|----------|
| 用户管理 | 用户管理（树形布局） | 管理员工信息，支持按组织查看用户 |
| 组织管理 | 组织管理（树形表格） | 管理组织结构，支持层级展示 |

---

## 二、页面1：用户管理

### 2.1 页面功能

用户管理页面采用**左右分栏布局**，左侧为组织架构树，右侧为用户列表。点击左侧组织节点，右侧显示该组织下的用户。

### 2.2 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  [Tab: 用户管理] [组织管理]                                  │
├────────────────────┬────────────────────────────────────────┤
│  组织架构树        │  用户列表区域                           │
│  ┌──────────────┐  │  ┌────────────────────────────────────┐│
│  │ 🔍输入组织关键字│  │  │ 搜索：请输入员工姓名 [查询]      ││
│  ├──────────────┤  │  ├────────────────────────────────────┤│
│  │ ▼ 搜狐集团   │  │  │ [新增人员] [启用] [停用] [批量删除] ││
│  │   ▼ 集团总部 │  │  ├────────────────────────────────────┤│
│  │     ○ 财务中心│  │  │ ☐│工号│姓名│邮箱│职级│职务序列│...││
│  │     ○ 法律中心│  │  │ ☐│1176│苑竹│zhu..│ 5  │ 否    │...││
│  │   ○ 搜狐媒体 │  │  │ ☐│2016│罗励│mai..│ 4B │ 是    │...││
│  │   ○ 视频     │  │  │ ...                              ││
│  │   ○ 焦点     │  │  └────────────────────────────────────┘│
│  └──────────────┘  │                                        │
└────────────────────┴────────────────────────────────────────┘
```

### 2.3 左侧：组织架构树

**功能**：显示企业的组织架构，支持展开/折叠，点击选择组织

**组件**：`SidebarTreeNode`递归组件

**交互**：
- 点击组织名称：选中该组织，右侧显示该组织下的用户
- 点击展开/折叠图标：展开或折叠子节点
- 搜索框：输入关键字过滤组织

**数据字段**：
- 组织名称（如"搜狐集团"、"集团总部"）
- 组织类型（公司、部门）

### 2.4 右侧：用户列表

#### 2.4.1 搜索区域

**搜索字段**：

| 字段名 | 控件类型 | 说明 |
|--------|----------|------|
| 员工姓名 | 文本输入框 | 支持模糊搜索 |

**按钮**：
- **查询**：蓝色主按钮，图标 Search，点击后根据条件筛选用户

#### 2.4.2 工具栏

| 按钮名称 | 按钮类型 | 按钮样式 | 功能说明 |
|----------|----------|----------|----------|
| 新增人员 | AntButton | type="primary" icon=Plus | 打开新增用户弹窗 |
| 启用 | AntButton | type="default" className="text-green-600" icon=CheckCircle | 启用选中的用户 |
| 停用 | AntButton | type="danger" icon=XCircle | 停用选中的用户 |
| 批量删除 | AntButton | type="default" icon=Trash2 | 删除选中的用户（需先勾选） |

#### 2.4.3 数据表格

**表格列**：

| 列名 | 数据字段 | 说明 |
|------|----------|------|
| ☐（复选框） | - | 用于批量选择 |
| 工号 | id | **可点击**，点击后查看用户详情 |
| 姓名 | name | 员工姓名 |
| 邮箱 | email | 员工邮箱 |
| 职级 | level | 员工职级（如 4B、3A 等） |
| 职务序列 | isTech | 是/否，表示是否为技术序列 |
| 员工状态 | empStatus | 状态标签：在职（蓝色）/ 离职（灰色） |
| 使用状态 | usageStatus | 状态标签：启用（绿色）/ 停用（红色） |
| 操作 | - | 编辑按钮（type="link"） |

**员工状态标签样式**：
```jsx
<span className={`px-2 py-0.5 rounded text-xs ${empStatus === 'employed' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
  {empStatus === 'employed' ? '在职' : '离职'}
</span>
```

**使用状态标签样式**：
```jsx
<span className={`px-2 py-0.5 rounded text-xs ${usageStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
  {usageStatus === 'active' ? '启用' : '停用'}
</span>
```

#### 2.4.4 用户详情页

**触发方式**：点击用户表格中的"工号"链接

**页面标题**：用户信息

**显示字段**（两列布局）：

| 左侧列 | 右侧列 |
|--------|--------|
| 姓名 | 联系电话 |
| 所在部门 | 状态有效 |
| 登录名 | 性别 |
| 移动电话 | Email地址 |
| 拥有的角色 | 上级领导 |
| 员工职级 | 职类 |
| 公司 | 职目 |
| 成本中心 | |
| HR公司 | |
| 部门全称 | |
| 办公区 | |
| 职位 | |

**返回按钮**：AntButton type="default"，点击返回用户列表

---

## 三、页面2：组织管理

### 3.1 页面功能

组织管理页面采用**树形表格布局**，以树形结构展示企业的组织层级，支持展开/折叠查看。

### 3.2 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  [Tab: 用户管理] [组织管理]                                  │
├─────────────────────────────────────────────────────────────┤
│  工具栏                                                      │
│  [新增] [导出] [批量操作▼] [启用] [停用]     展开1级▼  🔍组织名称  ⚙ │
├─────────────────────────────────────────────────────────────┤
│  树形表格                                                    │
│  ☐ │序号│组织机构          │架构图│组织类别│在职(直属/总共)│...│操作│ │
│  ☐ │ 1  │▼ 搜狐集团(D0001)│  🏢  │  公司  │  1 / 2743   │...│编辑│ │
│  ☐ │ 2  │  ▼ 集团总部     │  📁  │  部门  │  0 / 543    │...│编辑│ │
│  ☐ │ 3  │    ○ 财务中心   │  📁  │  部门  │  0 / 45     │...│编辑│ │
│  ☐ │ 4  │    ○ 法律中心   │  📁  │  部门  │  0 / 12     │...│编辑│ │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│                                                   共 5 条记录│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 工具栏

#### 3.3.1 左侧按钮组

| 按钮名称 | 按钮类型 | 按钮样式 | 功能说明 |
|----------|----------|----------|----------|
| 新增 | AntButton | type="primary" icon=Plus | 打开新增组织弹窗 |
| 导出 | AntButton | type="default" | 导出组织数据 |
| 批量操作 | AntButton | type="default" icon=Edit | 弹出批量操作菜单 |
| 启用 | AntButton | type="default" className="text-green-600" icon=CheckCircle | 启用选中的组织 |
| 停用 | AntButton | type="danger" icon=XCircle | 停用选中的组织 |

#### 3.3.2 右侧控件

| 控件名称 | 控件类型 | 功能说明 |
|----------|----------|----------|
| 展开1级 | 下拉选择框 | 控制树形表格展开级别 |
| 组织名称搜索 | 搜索框 | 输入关键字搜索组织 |
| 设置 | AntButton type="default" icon=Settings | 打开设置菜单 |

### 3.4 数据表格

**表格列**：

| 列名 | 数据字段 | 说明 |
|------|----------|------|
| ☐（复选框） | - | 用于批量选择 |
| 序号 | index | 自动编号（从1开始） |
| 组织机构 | title | 带层级缩进，显示组织名称 |
| 架构图 | - | 图标按钮，点击查看架构图 |
| 组织类别 | type | 公司或部门 |
| 在职(直属/总共) | direct / total | 直属人数 / 总人数 |
| 部门负责人 | leader | 负责人姓名 |
| 部门编码 | code | 组织编码（如 D0001） |
| 状态 | status | 状态标签：已启用（绿色）/ 停用（灰色） |
| 操作 | - | 编辑按钮（type="link"） |

**组织机构列显示规则**：
- 使用层级缩进（`paddingLeft: level * 24px`）
- 公司类型：蓝色 Building2 图标
- 部门类型：黄色 FolderOpen 图标
- 有子节点：显示展开/折叠图标（ChevronRight / ChevronDown）
- 无子节点：显示空占位符

**状态标签样式**：
```jsx
<span className={`px-2 py-0.5 rounded text-xs ${node.status === '已启用' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
  {node.status}
</span>
```

### 3.5 分页栏

**显示位置**：表格底部

**显示格式**：`共 X 条记录`

---

## 四、数据结构

### 4.1 组织数据结构

```typescript
interface OrgNode {
  key: string;           // 唯一标识（如 'D0001'）
  title: string;         // 组织名称（如 '搜狐集团 (D0001)'）
  type: string;          // 组织类型（'公司' | '部门'）
  direct: number;        // 直属人数
  total: number;         // 总人数
  leader: string;        // 负责人姓名
  code: string;          // 部门编码
  status: string;        // 状态（'已启用' | '已停用'）
  children?: OrgNode[];  // 子组织（可选）
}
```

### 4.2 用户数据结构

```typescript
interface User {
  id: string;            // 工号
  name: string;          // 姓名
  email: string;         // 邮箱
  level: string;         // 职级（如 '4B', '3A'）
  isTech: string;        // 职务序列（'是' | '否'）
  dept: string;          // 所在部门
  deptCode: string;      // 部门编码
  empStatus: string;     // 员工状态（'employed' | 'resigned'）
  usageStatus: string;   // 使用状态（'active' | 'inactive'）
}
```

### 4.3 用户详情结构

```typescript
interface UserDetail {
  name: string;
  dept: string;
  loginName: string;
  mobile: string;
  roles: string;
  level: string;
  company: string;
  costCenter: string;
  hrCompany: string;
  fullDeptName: string;
  office: string;
  position: string;
  phone: string;
  statusValid: string;
  gender: string;
  email: string;
  manager: string;
  jobCategory: string;
  jobSubCategory: string;
}
```

---

## 五、交互流程

### 5.1 用户管理流程

1. **查看用户列表**
   - 左侧点击组织节点
   - 右侧显示该组织下的用户列表

2. **查看用户详情**
   - 点击用户表格中的"工号"链接
   - 跳转到用户详情页
   - 点击"返回"按钮返回列表

3. **新增用户**
   - 点击"新增人员"按钮
   - 打开新增用户弹窗

4. **启用/停用用户**
   - 勾选用户记录
   - 点击"启用"或"停用"按钮
   - 更新用户状态

5. **删除用户**
   - 勾选用户记录
   - 点击"批量删除"按钮
   - 确认删除

### 5.2 组织管理流程

1. **查看组织结构**
   - 页面加载后显示树形表格
   - 点击展开/折叠图标查看子组织

2. **搜索组织**
   - 在搜索框输入组织名称
   - 实时过滤显示匹配的组织

3. **新增组织**
   - 点击"新增"按钮
   - 打开新增组织弹窗

4. **启用/停用组织**
   - 勾选组织记录
   - 点击"启用"或"停用"按钮
   - 更新组织状态

5. **导出数据**
   - 点击"导出"按钮
   - 下载组织数据

---

## 六、按钮样式规范

### 6.1 AntButton类型

| 类型 | 样式说明 | 使用场景 |
|------|----------|----------|
| primary | 蓝色背景白色文字 | 主要操作（新增、查询、保存） |
| default | 白色背景灰色边框 | 次要操作（导出、批量操作） |
| danger | 白色背景红色文字 | 危险操作（停用、删除） |
| link | 透明背景蓝色文字 | 操作列链接（编辑） |

### 6.2 状态标签样式

**启用状态**：
```jsx
<span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">启用</span>
```

**停用状态**：
```jsx
<span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">停用</span>
```

**在职状态**：
```jsx
<span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">在职</span>
```

**离职状态**：
```jsx
<span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">离职</span>
```

---

## 七、技术实现

### 7.1 组件文件

- **主组件**：`src/pages/xitongrules.js`
- **组件名**：`OrgAndUserContainer`
- **导入方式**：在 `src/pages/yewurules.js` 中导入

### 7.2 状态管理

```javascript
// 用户管理状态
const [activeTab, setActiveTab] = useState('user');  // 'user' | 'org'
const [viewingUserId, setViewingUserId] = useState(null);
const [expandedKeys, setExpandedKeys] = useState(['D0001', 'D0002']);
const [selectedKey, setSelectedKey] = useState('D0002');
const [selectedRows, setSelectedRows] = useState([]);

// 组织管理状态
const [tableExpandedKeys, setTableExpandedKeys] = useState(['D0001']);
```

### 7.3 核心函数

- `toggleTableExpand(key)`：切换组织表格的展开/折叠状态
- `getFlattenedData(nodes, level, parentExpanded)`：将嵌套的组织数据展平用于表格渲染

---

## 八、相关文档

- README.md - 项目说明和架构
- CLAUDE.md - 项目约定和规则
- MEMORY.md - Agent记忆索引
- 其他PRD文档 - docs/PRD-*.md

---

## 九、版本信息

- 创建日期：2026-06-04
- 最后更新：2026-06-04
- 文档版本：v1.0
