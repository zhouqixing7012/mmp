# 标签打印 PRD 整改 Implementation Plan

> **For agentic workers:** This plan is executed inline in the current workspace. Steps use checkbox syntax for tracking.

**Goal:** 重构标签打印主 PRD，保留业务细节并统一三条打印链路、标签模板、权限和校验口径。

**Architecture:** 原版 PRD 保持只读，新版 PRD作为最终业务规则；三方比对和对抗性测试只记录当前最终口径，不把演示实现当成生产事实。

**Tech Stack:** Markdown、Git、Node.js UTF-8 文本检查。

---

### Task 1: 重构主 PRD

**Files:**
- Modify: `docs/标签打印、打印历史、标签预打印+PRD.md`

- [x] 保留原有标签编码、流水、跨年、页面字段、导出、打印历史和校验细节。
- [x] 将正文整理为背景、权限、通用规则、页面字段及交互、校验、后续操作/业务结果/补充说明。
- [x] 拆开资产标签补打、标签预打印、接收单标签打印。
- [x] 补充角色权限、标签类型、标签模板和二维码规则。
- [x] 修正主列表补打为只累计 `PRINTED_COUNT`，不写批次、明细或打印日志。
- [x] 将权限改为王英、刘建及待定机房管理员的明确范围。
- [x] 明确部件标签不进入主列表、现有代码使用“包含 `-V`”判断。
- [x] 修正常规超长标签删除的是规则中的年份后两位，并排除最大流水极限场景。
- [x] 清除“沿用现状”变体和技术实现语言，改为业务规则与业务结果。
- [x] 按字段、选择弹窗、按钮规范补齐业务含义和交互条件。
- [x] 删除排除性说明、Brother运行依赖和独立“页面固定口径”，将有效规则归回对应页面。

### Task 2: 对齐比对与测试记录

**Files:**
- Modify: `docs/COMPARE-标签打印-原版PRD-vs原型-vs新版PRD.md`
- Modify: `docs/TEST-标签打印-对抗性测试.md`
- Modify: `docs/TEST-标签打印-对抗性测试-第二轮.md`

- [x] 删除“部件标签规则本轮不调整”的旧例外。
- [x] 把三条打印链路和主/部件模板规则改为最终确认口径。
- [x] 保留原型不能验证的后端、权限和 Brother 联调边界。

### Task 3: 项目记录与校验

**Files:**
- Modify: `CONTEXT.md`

- [x] 记录本次 PRD 整改、目标文件字数变化和主要决定。
- [x] 用 UTF-8 统计修改前后字符数、行数和 Markdown 结构。
- [x] 扫描旧冲突表述，确认原版 PRD未被修改，工作区只包含本次文档变更。
