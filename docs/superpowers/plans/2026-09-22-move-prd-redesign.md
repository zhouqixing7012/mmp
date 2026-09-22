# Move PRD Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 保留全部已确认业务细节并完整重构移库 PRD。

**Architecture:** 以 GitHub `feature/asset-inventory` 分支移库 PRD 为原始基线，先建立规则保留清单，再按用户固定结构重新组织。主 PRD只写最终业务行为，三方走查记录 PRD与当前原型差异，CONTEXT记录最新决定。

**Tech Stack:** Markdown、Git、`rg`、Node.js只读校验、`git diff --check`。

---

### Task 1: 建立规则保留清单

**Files:**
- Modify: `findings.md`

- [x] 记录原 PRD 中范围、权限、仓库、状态、锁、调出、验证、接收、驳回、反向移库、导入导出、打印、通知催办、移动端、审计规则。
- [x] 标记已确认删除或替换的规则。

### Task 2: 重构主 PRD

**Files:**
- Modify: `docs/PRD-库存管理-移库.md`

- [x] 按正式七章结构重排全文。
- [x] 写清实时保存、锁、提交、接收、驳回和反向移库闭环。
- [x] 补齐 PC 发起列表、编辑页、接收列表、接收详情字段和按钮。
- [x] 补齐移动端页面、字段、入口、扫码、狐小E、接收和驳回规则。
- [x] 保留 Excel 导入、打印、导出、通知催办和历史信息规则。
- [x] 删除接收 Excel、取消验证、已取消状态、通知/催办展示字段、外部同步及技术语言。

### Task 3: 同步记录

**Files:**
- Modify: `docs/三方比对-库存管理-全模块PRD走查.md`
- Modify: `CONTEXT.md`
- Modify: `progress.md`

- [x] 记录主 PRD新结构和确认变化。
- [x] 明确 React 原型尚未同步的内容。

### Task 4: 验证

**Files:**
- Verify: `docs/PRD-库存管理-移库.md`

- [x] 检查七章结构、四种单据状态、四种明细状态和完整流程。
- [x] 检查删除内容与保留内容。
- [x] 检查禁用技术词和无效否定句。
- [x] 运行 `git diff --check`。
- [x] Review 查 Bug并做第一性原理检查。
