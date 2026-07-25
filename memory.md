# Memory

<!-- Long-term facts and notes go here -->

## 标注系统 (2026-06-24)

- 基于 prototype-annotation 技能搭建非侵入式标注层
- 模块：src/prototype-annotations/（annotation-data.js + Layer + Panel + hook）
- 使用：元素加 data-prototype-anchor + annotation-data.js 加数据
- 关键踩坑：visibleAnnotations 用 useMemo 从 hotspots 推导而不独立维护 state；toggle() 关闭时清理 .paf-target-highlight
- 当前试点：yewurules.js「物料综合集合」(3个标注点)

## 项目状态 (2026-07-01)

- 后台基础配置页 (`yewurules.js`) 4572 行，包含 34+ 子视图组件
- 已合并的模块：字典管理 (`dictmanagement.js`)、角色管理 (`rolemgt.js`)
- 菜单结构：一级菜单 5 个（个人工作台、资产管理、无形资产、资产盘点、后台基础配置）
- 后台基础配置子菜单 14 个，各子菜单下含多个 Tab 页面
- PRD 文档体系已完善（约 20 份），偏好风格见 PRD-业务基础数据维护.md
- 技术栈：React 19 + Antd 6 + Tailwind CSS + Lucide React
- 远程仓库：gitee / github 双远程
- 上次提交：2026-06-29 (85fa059)
- 代码规范：统一使用 Antd 组件 + StatusTag + SelectModal + QueryBar
- 原型标注层 (PrototypeAnnotation) 在 yewurules.js 物料综合集合页试点中

## 变更记录 (2026-07-02)

- 业务映射规则菜单新增 2 个页面：公司板块领取资产权限、机房资产领取权限（从原业务权限规则管理迁移）
- 公司板块领取资产权限：去除删除按钮，新增是否启用字段（表格列 + 弹窗单选按钮），必填仅保留公司、员工所属公司
- 机房资产领取权限：同样去除删除按钮，新增是否启用，弹窗改为标准四列布局（w-[15%]/w-[35%]/w-[15%]/w-[35%]）
- 用户管理页面：用户表去除新增人员、批量删除按钮，角色分配弹窗改为 step-in-place 单弹窗，样式统一为标准按钮栏
- 角色管理页面 (`rolemgt.js`) 已集成至 yewurules.js 菜单
- 物料大类弹窗：去除重复的是否启用字段行
- 产出了 4 份新 PRD（用户管理、角色管理、业务映射规则补充），按标准格式
- TODO: 业务映射规则管理现有 PRD 已更新追加页面6、7
- 用户管理角色分配弹窗采用原位替换设计（step-in-place），避免弹窗嵌套
- 弹窗按钮栏样式统一：footer={null} + flex justify-center gap-3 mt-6 + px-6 按钮

## 变更记录 (2026-07-15)

- 整合外部项目报废申请单编辑页（ScrapApplicationEdit），独立 CSS 文件，不转 Tailwind
- 新增路由 /BaofeiShenqing，导航项"报废申请单编辑"
- 基本信息新增三个必填字段：公司（财务公司 SelectModal弹窗）、资产大类（Antd Select下拉：服务器/网络设备）、资产所在地（Antd Select下拉：北京/非北京）
- 保存/提交时校验必填字段，校验不通过显示红色错误状态
- 布局改为三三一一：基础信息(3列) → 必填字段(3列) → 申请日期(1列) → 报废说明(1列)
- 提交：373bc59
- 旧 ScrapForm.js（路由文件，不再使用）未删除
- 相关 PRD 未产出

## 变更记录 (2026-07-19)

- 工作台首页（gerengerzuotai）从完整 TSX 转换版经多次精简，最终由用户重写为紧凑布局：移除侧边栏、顶部导航、问候横幅、指标卡片、刷新/导出
- 工作台首页表格加横向滚动 + 冻结列 + 操作按钮（退库/转移/更换）
- 资产申请页（zichanshenqing.js）左侧资产商城改为弹窗，树形区域加宽至 200px
- 筛选按钮改为标签页切换
- 新增 haoma.js（电话卡申请表单），去装饰白卡布局
- 新增 haomakongzhi.js（合约号码申请人员管理），StatusTag 状态列，UserLinkModal 选人弹窗
- yewurules.js 个人工作台菜单：工作台首页 / 新增资产申请 / 资产申请审批 / 资产申请配给 / 号码管理 / 号码控制
- 远程仓库：gitee / github 双远程，当前分支 feat/business-rule-updates
- 提交 47565f6
