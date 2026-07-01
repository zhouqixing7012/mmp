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
