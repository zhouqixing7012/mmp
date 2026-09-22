# Employee Asset Query PRD Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留已确认规则并完整重构员工资产信息查询 PRD，同步本轮字段调整和项目记录。

**Architecture:** 以 GitHub `feature/asset-inventory` 分支主 PRD 为唯一需求基线，按用户固定章节重排内容。主 PRD 保存最终业务规则，三方比对记录本轮差异，CONTEXT 只记录当前决定。

**Tech Stack:** Markdown、Git、`rg`、`git diff --check`。

---

### Task 1: 重构主 PRD

**Files:**
- Modify: `docs/PRD-资产管理-员工资产信息查询.md`

- [x] **Step 1:** 按“背景 → 权限 → 通用规则 → 页面字段及交互 → 校验 → 后续操作/业务结果/补充说明”重排正文。
- [x] **Step 2:** 删除“改造总结”、技术字段和重复规则。
- [x] **Step 3:** 写入耗材与合约号码最终字段、来源、空值和点击规则。
- [x] **Step 4:** 补齐员工选择、查询、重置、页签联动、分页、空状态和异常规则。
- [x] **Step 5:** 保留资产、单据信息、排序、权限、历史单据等既有确认细节。

### Task 2: 同步项目记录

**Files:**
- Modify: `docs/COMPARE-员工资产信息查询-原版PRD-vs原型-vs新版PRD.md`
- Modify: `CONTEXT.md`

- [x] **Step 1:** 更新三方比对中的耗材、合约号码字段和本轮最终口径。
- [x] **Step 2:** 在 CONTEXT 追加本轮 PRD 重构决定，不重复展开正文。

### Task 3: 验证

**Files:**
- Verify: `docs/PRD-资产管理-员工资产信息查询.md`
- Verify: `docs/COMPARE-员工资产信息查询-原版PRD-vs原型-vs新版PRD.md`

- [x] **Step 1:** 使用 `rg` 检查旧字段、技术字段和模糊表述是否残留。
- [x] **Step 2:** 对照字段清单检查耗材 6 项、合约号码 12 项是否完整且顺序一致。
- [x] **Step 3:** 运行 `git diff --check`，预期退出码为 0。
- [x] **Step 4:** Review 查 Bug，再做第一性原理检查，确认没有为了结构精简而丢失规则。
