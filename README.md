# 企业资产管理系统（Asset Management System）

## 项目概述

这是一个基于React的企业资产管理系统，用于管理企业的固定资产、耗材、低值耐用品等。系统包含资产管理、报废处理、盘点管理、业务规则配置等多个模块。

## 技术栈

- React 18 + Create React App
- Tailwind CSS
- Lucide React（图标库）
- Antd风格的自定义组件

## 项目结构

```
src/
├── components/          # 通用组件（FormField、Modal、Navbar等）
├── config/              # 配置文件（路由配置等）
├── pages/               # 页面组件
│   ├── yewurules.js    # 业务规则管理（包含业务配置和系统配置）
│   ├── xitongrules.js  # 系统配置（已合并到yewurules.js）
│   └── ...             # 其他业务页面
├── App.js              # 主应用入口
└── index.js            # 应用启动文件

docs/                   # 产品需求文档（PRD）
├── PRD-业务基础数据维护.md
├── PRD-业务映射规则管理.md
└── ...                 # 其他PRD文档
```

## 主要功能模块

### 1. 业务配置
- 物料基础数据维护（物料大类、小类、品牌、型号、配置）
- 业务映射规则管理（办公区与仓库映射、新员工领用映射等）
- 业务权限规则管理（公司板块提取权限、设备提取权限等）
- 仓库基础数据维护（仓库信息、用途、权限）
- 会计映射规则管理（HR公司与财务公司映射、成本中心映射等）
- 资产配给规则管理（电脑配给、影像器材配给等）
- 费用账户规则管理（费用科目映射、成本中心映射等）

### 2. 系统配置
- 组织与用户管理（用户管理、组织管理）

### 3. 个人工作台
- 工作台首页（/gerengerzuotai）—— 资产/耗材/合约号码统一查看，搜索筛选排序，操作列含退库/转移/更换
- 新增资产申请（/zichanshenqing）—— 资产商城弹窗选品，申请明细表单
- 号码管理（/haoma）—— 电话卡申请表单
- 号码控制（/haomakongzhi）—— 申请人员白名单管理，StatusTag 状态标签，UserLinkModal 选人弹窗

### 4. 报废管理
- 报废申请单编辑（/BaofeiShenqing）—— 新增报废资产、填写报废说明、表格编辑
- 账面报废申请单（/，AccountingScrapEdit）—— 账面报废处理
- 报废申请单审批（/approval）—— 审批流程
- 报废申请单内审（/BaofeiNeishen）—— 内部审核
- 报废申请单采购（1-4）—— 采购流程各环节

## 运行项目

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 关键设计决策

### 1. 弹窗选择组件
系统使用统一的弹窗选择组件来处理所有需要从列表中选择数据的场景，包括：
- 物料大类选择
- 品牌选择
- 型号选择
- 配置选择
- 公司选择
- 部门选择
- 仓库选择

所有弹窗选择组件都遵循相同的交互模式：
- 点击输入框的任何位置都会弹出选择弹窗
- 输入框设置为readOnly（防止直接编辑）
- 使用pointer-events-none让点击事件穿透到父容器

### 2. 菜单结构
系统采用侧边栏菜单结构，主要分为：
- 业务配置（包含多个子菜单）
- 系统配置（组织与用户管理）

### 3. 组件复用
系统大量使用可复用组件，包括：
- AntButton（按钮组件）
- AntInput（输入框组件）
- AntSelect（下拉选择组件）
- AntRadio（单选按钮组件）
- AntModal（弹窗组件）
- AntTable（表格组件）
- QueryBar（查询栏组件）

## 开发规范

### 1. 样式规范
- 使用Tailwind CSS进行样式编写
- 遵循Antd设计风格
- 使用语义化的颜色token

### 2. 组件开发规范
- 每个页面组件都应该有对应的弹窗选择组件（如果需要选择数据）
- 弹窗选择组件应该遵循统一的交互模式
- 所有表单字段都应该有适当的验证和交互

### 3. 文件组织规范
- 页面组件放在src/pages/目录下
- 通用组件放在src/components/目录下
- 配置文件放在src/config/目录下
- 文档放在docs/目录下

## 相关文档

- docs/PRD-业务基础数据维护.md - 业务基础数据维护的产品需求文档
- docs/PRD-业务映射规则管理.md - 业务映射规则管理的产品需求文档
- docs/PRD-业务权限规则管理.md - 业务权限规则管理的产品需求文档
- docs/PRD-仓库基础数据维护.md - 仓库基础数据维护的产品需求文档
- docs/PRD-会计映射规则管理.md - 会计映射规则管理的产品需求文档
- docs/PRD-费用账户规则管理.md - 费用账户规则管理的产品需求文档
- docs/PRD-资产配给规则管理.md - 资产配给规则管理的产品需求文档
- docs/PRD-资产折旧规则管理.md - 资产折旧规则管理的产品需求文档
- docs/PRD-账套内容维护.md - 账套内容维护的产品需求文档
- docs/PRD-单据编号规则管理.md - 单据编号规则管理的产品需求文档
- docs/PRD-地点基础数据维护.md - 地点基础数据维护的产品需求文档
- docs/PRD-物资申请超标配置.md - 物资申请超标配置的产品需求文档
- docs/PRD-补充说明.md - 补充说明文档
- docs/PRD-补充说明-详细版.md - 补充说明详细版文档

## 贡献指南

1. Fork项目
2. 创建功能分支（git checkout -b feature/AmazingFeature）
3. 提交更改（git commit -m 'Add some AmazingFeature'）
4. 推送到分支（git push origin feature/AmazingFeature）
5. 创建Pull Request

## 许可证

MIT License
