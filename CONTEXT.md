# 当前状态

- 项目为企业资产管理产品演示前端，继续直接在 `main` 迭代；不新建分支或 worktree，除非用户明确要求。
- 当前阶段：个人工作台、资产管理、库存管理主要原型已建立，后续继续按截图和 PRD 逐页校准。
- PRD 已存放在仓库 `docs/`，原型标注由 Agent 直接读取 PRD + React 页面代码后生成；浏览器端不上传 PRD、不调用 AI，只负责查看和人工校准。
- 原型标注已支持：全局页面作用域、细粒度 target、拖动位置、内容编辑、重新绑定、新增/删除、保存、导入导出、面板最小化、业务浮层感知、Markdown/表格展示、target/display-anchor 分离。
- 标注保存采用“代码基线 + 用户覆盖层”：新基线 id 自动出现，同 id 的用户人工修改继续保留，避免整页 localStorage 快照挡住 Agent 后续更新。
- 合约号码申请模块 6 个页面已有 16 条 PRD 基线标注；字段规则和按钮规则已按具体对象拆分。
- 资产借用模块已完成复杂压力测试：5 个页面生成 35 条 PRD 基线标注，coverage ledger 拆出 59 个研发重点，其中 20 项因页面缺失、实现差异或 PRD 冲突进入 `review`，4 项明确 `skip`。
- 2026-08-18 修复资产借用“标注拆得细但大量未匹配”的根因：Card target 现在只取稳定主标题，不再把“共 X 件/条”、状态数字、统计副标题等动态展示文案拼入 target；resolver 对历史 target 增加“同 kind + 同语义 key + 唯一上下文前缀”兼容回退。
- 2026-08-18 标注面板将弹窗关闭造成的暂时不可见目标从真正失配中分离：统计改为“已匹配 / 动态目标 / 真未匹配”，动态目标显示“需打开弹窗”。资产借用申请的“已阅读”和“添加资产搜索框”先作为兼容动态目标。
- 2026-08-18 Ant Design `Descriptions` 已进入正式目标模型：普通值可回退到对应字段标签，内部 Select/Input 使用“当前仓库 / 城市 / 使用说明”等稳定字段名生成 target，必填星号不进入语义 key。
- 2026-08-18 审批/办理按钮增加“唯一按钮文案”语义兼容：exact target 因“审批操作→审批信息”等父分组改名失效时，只要当前页面同文案 Button 唯一，`同意 / 驳回 / 返回 / 加签` 等可直接恢复匹配；存在两个同名按钮时不猜测。

# 上次停留位置

- 用户反馈资产借用标注匹配率较低。排查确认不是“拆得细”本身导致，而是 target 稳定性和动态 DOM 统计口径问题。
- 资产借用申请页的“借用资产明细”Card 标题实际由“借用资产明细 + 共 X 件”组成；旧逻辑把整个标题文本作为 Card 语义上下文，导致数量变化时 Card 及其内部“借用数量 / 借用日期 / 借用原因 / 需求说明 / 添加资产”等 target 一起变化，形成成片未匹配。现已改为只取稳定主标题。
- `resolvePrototypeTarget` 在 exact target 找不到时允许非常保守的兼容匹配：kind 和语义 key 必须一致，只允许上下文前缀兼容，并且候选必须唯一；避免为了提高匹配率发生跨模块误绑。
- 审批操作按钮在当前页面文案唯一时进一步允许忽略父 Card 上下文恢复匹配，用于兼容历史基线记录“审批操作”，而当前页面已改成“审批信息”等情况；同名按钮超过一个时保持未匹配，不做模糊猜测。
- 面板原本只有“已匹配 / 未匹配”两种状态，弹窗关闭后 DOM 自然不存在也被算成错误。现在弹窗生命周期目标单列为“动态目标 / 需打开弹窗”，不再污染“真未匹配”。
- 已补回归测试场景：动态 Card 从“共 0 件”变为“共 9 件”后，Card target 与内部表头 target 都应保持不变；动态弹窗目标不计入真未匹配；审批父分组改名后唯一的“同意/驳回”按钮仍应恢复，出现两个同名按钮时禁止猜测。
- 最新相关代码已提交到 `main`；当前等待最新 Vercel 构建完成。
- 资产借用第一轮 coverage 暴露的业务/实现差异仍保持 `review`，没有因为提高匹配率而强行绑定：申请页缺配置列、物资搜索范围偏窄、仓库/公司板块权限过滤不足、资产标记/真实锁定缺失、审批链缺动态 5级+ 与 VP/CEO-1、发放页缺员工名下资产查询和升级耗材子表、盘点条件展示不一致、确认方式实现差异、出库状态口径冲突、核心出库套打页暂无对应 target。

# 原型标注生成与质量规则

- Agent 生成标注前先把 PRD 拆成最小 Requirement Atom，至少明确来源、页面、objectType、具体对象和规则；一个段落涉及多个按钮/字段/业务分支时必须继续拆分。
- 标注粒度按规则真实归属决定：
  - 字段必填/只读/默认值/枚举/长度/附件格式等 → field/control/table-column；
  - 按钮动作及副作用 → action-rule；
  - Tab 规则 → tab-rule；
  - 跨字段、统一准入、流程状态、公共系统动作 → module/page rule。
- 页面存在更细目标时禁止为了省事回退模块：`action-rule` 必须 Button，`field-rule` 必须字段/控件，`tab-rule` 必须 Tab，`table-column-rule` 必须表头。
- 每个 PRD 模块同步维护 Requirement Coverage Ledger：
  - `bound`：已精确绑定；
  - `review`：PRD 与页面/最新口径冲突，或当前没有可靠 target；
  - `skip`：明确无需单独标注，必须写原因。
- `annotation-quality.js` 同时做 Granularity Check 与 Coverage Check；“位置准确”和“内容不遗漏”分别校验。
- 复杂模块不能只看 UI 是否存在：还要对照代码检查权限过滤、锁定、状态机、审批路由、条件展示、通知/待办/出库等系统副作用。
- 不属于当前页面的研发规则不能错绑：核心出库、套打模板、定时提醒等应在真实承载页面/系统规则位置标注；当前无可靠目标时留 `review`。
- target 稳定性禁止依赖动态文案：`共 X 件/条`、统计数字、状态计数、运行时业务值不得成为 target 的稳定语义来源。
- 弹窗/抽屉/条件渲染目标应声明动态生命周期，例如 `context.targetLifecycle = 'overlay'`；关闭时归类为动态目标，而不是“真未匹配”。
- Button resolver 的语义回退遵循“文案唯一才匹配”：父模块名称变化不能让清晰的审批动作失配，但存在多个同名 Button 时必须保留上下文约束，禁止自动误绑。

# 当前标注交互约定

- 页面作用域：普通路由使用 `route:<pathname>`；`/yewurules` 由 `activeMenu / activeSubMenu / activeTab` 形成独立 scope。
- target 与 display anchor 分离：target 决定规则归属、高亮、重绑和稳定重建；字段/控件序号贴自身，Card/模块序号优先贴实际标题文字。
- 新增/重绑时实时从 DOM 判断最细目标，不依赖页面首次预扫描是否成功。
- 目标优先级：Button / Descriptions 字段 / 表头 / Tabs / Radio / Checkbox / Segmented / Switch / Select / DatePicker / Slider / Rate / Upload / 输入控件 → DetailItem/FormField/QueryItem/FormItem/SelectModal 语义块 → 显式模块锚点 → Card/Table/Form/普通业务块。
- 业务 Modal/Drawer/SelectModal 打开后，底层页面标注点隐藏，仅当前顶层业务浮层内部目标展示。
- 需要在绑定状态先打开弹窗/下拉时，按住 Alt/Option 点击业务控件，只执行原业务交互且保持 bindingMode，再选择浮层内部目标。
- 查看态点击标注展开，再点同一条或箭头收起；详情区不重复放第二个“收起”按钮。
- 标注内容继续使用 `section.title + items[]` 持久化；普通条目自动项目符号，支持受控 Markdown 子集和表格，不解析原始 HTML。
- 用户拖动只保存相对锚点的 `side / align / gap / offsetX / offsetY / viewportPadding`，不保存绝对 x/y。

# 当前全局设计规范

- PC 业务页使用单层画布；页面标题用 `Typography.Title level={4}`；蓝色竖块只用于业务 Card 标题。
- 业务分区使用 `Card size="small"`；详情优先 `DetailGrid + DetailItem`；列表使用 small bordered Table。
- 只读字段展示文本或 `StatusTag`；真实可编辑字段才使用 Input / Select / DatePicker / TextArea。
- 查询区域优先复用 `QueryBar / QueryItem`；选择类字段优先复用 `SelectModal`。
- 空值显示 `-`；公司/板块分开；部门用 `.` 连接。
- 员工确认全面取消电子签，统一刷卡/员工工号 + 狐小 e 扫码，并校验到真实申请人。
- “查看名下资产”统一使用眼睛图标 + 蓝色 link Button。
- 未确认字段不补造；截图只用于确认业务内容，视觉按当前项目规范重构。

# 当前模块状态

- 个人工作台：资产申请、审批、配给、领用、借用、更换、退库、耗材、合约号码等主链路已建立；合约号码和资产借用已开始使用 PRD 基线标注 + coverage ledger。
- 资产管理：资产维护、耗材维护、合约号码维护、标签打印、跨公司转移、资产报废、账面报废、资产处置、员工资产信息查询已建立。
- 库存管理：资产接收、耗材接收、入库、出库、移库、转移、库管员工作台已有主要原型，继续按后续字段和流程校准。
- 原型标注：已全局挂载；编辑器、覆盖层、页面作用域、细粒度目标、Descriptions、业务浮层、SelectModal、Markdown、target/display-anchor、Granularity/Coverage 质量门、动态 target 分类和稳定 target 重建均已建立；后续统一按“PRD 原子化 → 精确 target → 实现对照 → coverage ledger → quality check”生成。