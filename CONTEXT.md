# 当前状态

- 项目为企业资产管理产品演示前端，持续在 `main` 迭代；除用户明确要求外不新建开发分支或 worktree。
- 个人工作台、资产管理、库存管理、资产盘点主要原型已建立，继续按 PRD、截图和已确认业务口径逐页校准。
- 原型标注体系已进入研发评审阶段；规则继续遵循“PRD Requirement Atom → 最细业务 target → annotation → Coverage Ledger → Granularity/Coverage Check”，找不到稳定目标时进入 `review`，不粗绑 Card。
- 资产盘点正式入口已统一为“盘点项目 / 盘点报表”；盘点项目沿用去机房范围方案，历史方案仅保留代码不再展示；复盘全面取消内审监督人，仅保留财务监督人。
- 员工确认全面取消电子签，只保留刷卡/员工工号与狐小 e 扫码，并校验到真实申请人。
- 页面级操作（保存/提交/确认/返回/生成等）统一放页面底部居中；Card/表格内的导出、删除、局部查询等分区级操作保留在对应分区。
- 数量/计数统一千分位；金额/原值/净值等财务数字统一千分位 + 2 位小数。
- 2026-08-25 已将 ERP Figma `基础组件｜Library 修正版`（node `826:2`）新增规则补充到 `docs/UI_DESIGN_GUIDELINES.md`，规范升级为 V2.1。
- V2.1 已确认覆盖 Input、Radio、Checkbox、Switch、Breadcrumb、Dropdown、Pagination、Tag、Badge、Popover、Grid、Layout、Divider、Anchor、Affix、FloatButton；Select、Table、Form、DatePicker、Upload 仍未确认完整 ERP 本地规范。
- V2.1 新增关键边界：Dropdown ≠ Select；Tag 不替代 `StatusTag`；ERP Grid 管页面级布局、`DetailGrid` 管业务详情三列；Divider 优先让位于留白；语义 Token 优先于页面直接使用基础色号。
- 2026-08-25 开始按 V2.1 收敛正式资产盘点 UI：新增统一 `SectionCardTitle`，首批覆盖盘点项目列表、盘点计划、盘点进度、图片审核、V3 盘点范围；盘点计划项目信息统一改用 `DetailGrid`；图片审核概览取消 Card 套 Card，改为单 Card 三列留白结构。
- 2026-08-27 资产配给“员工名下资产明细”已删除“物资总类”查询条件和列表列，并同步清理该页面关联筛选与派生字段。

# 当前停留位置

- UI 规范已同步最新 Figma 基础组件规则，后续新增/重画页面默认按 `docs/UI_DESIGN_GUIDELINES.md` V2.1 执行。
- 资产盘点首批三项纯 UI 收敛已落代码，未修改字段、流程、状态机、Mock 和操作行为；后续继续按具体任务逐项收敛，不批量改业务。
- 当前停在“员工名下资产”同类弹窗范围确认：资产配给已调整；借用配给同类弹窗仍保留“物资总类”，待用户确认是否联动调整。
- 原型标注下一阶段继续逐模块处理 Coverage `review`，先确认 PRD 口径，再决定改原型、改 PRD 或保留为后端/流程能力。
- `review/rd-review` 仅保存阶段性已确认研发评审结论，不自动跟随 `main`。

# 关键决定

- 业务规则优先级高于设计系统；设计系统提供能力，不自动改变资产系统业务交互。
- 基础视觉优先在 Theme / 公共组件层吸收 ERP Design System，禁止业务页面重复硬编码。
- Figma 中与资产系统无关的聊天、通讯录、消息气泡等示例只用于理解语义 Token，不复制成资产系统业务规则。
- 未被 Figma 明确覆盖的组件不猜测、不静默补齐、不以单页实现反向定义全局规范。
- 状态继续统一通过 `StatusTag` 输出；选择弹窗继续使用 `SelectModal`；查询区继续使用 `QueryBar` + `QueryItem`。
- 页面分组优先顺序：留白 → 分组结构 → 必要 Divider → 新增容器，避免 Card 套 Card、边框套边框。
- 资产盘点公共 Card 标题优先复用 `SectionCardTitle`，ERP 主色只在该公共组件集中维护，业务页不再重复写标题蓝色值。