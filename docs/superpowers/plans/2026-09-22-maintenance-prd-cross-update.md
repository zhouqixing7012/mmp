# Maintenance PRD Cross Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 同步整改资产、耗材、合约号码维护 PRD，并记录适用于其他模块的详情弹窗规则。

**Architecture:** 三份主 PRD各自保存字段、模板、校验和业务结果；跨模块主资产联动在资产与耗材两份 PRD中双向说明；全模块详情弹窗规则先记录在 lessons，其他 PRD后续触及时再同步。

**Tech Stack:** Markdown、Git、`rg`、Node.js只读校验、`git diff --check`。

---

### Task 1: 资产维护 PRD

**Files:**
- Modify: `docs/PRD-资产管理-资产维护.md`

- [x] 修正列表详情为弹窗，并补详情态进入编辑态及返回列表状态。
- [x] 隐藏卡片业务线、项目，保留导出和财务计算。
- [x] 增加报废类型查询条件及三项枚举。
- [x] 完成批量模板空白保留规则。
- [x] 增加资产维护同步关联耗材字段和原子失败规则，不新增联动历史结论。

### Task 2: 耗材维护 PRD

**Files:**
- Modify: `docs/PRD-资产管理-耗材维护.md`

- [x] 修正列表详情为弹窗，并补详情态进入编辑态及返回列表状态。
- [x] 批量模板删除板块、耗材说明、数量，更新字段数、覆盖策略和校验。
- [x] 增加报废类型查询条件。
- [x] 增加三项报废字段及有主资产/无主资产两条维护规则。
- [x] 更新主资产报废联动、状态校验和业务结果。

### Task 3: 合约号码维护 PRD

**Files:**
- Modify: `docs/PRD-资产管理-合约号码维护.md`

- [x] 修正列表详情为弹窗，并补详情态进入编辑态及返回列表状态。
- [x] 删除身份证号码的单条编辑、卡片、批量模板、导出、历史和校验规则。
- [x] 将批量模板调整为 14 列并保持空白保留规则。

### Task 4: 项目记录

**Files:**
- Modify: `CONTEXT.md`
- Modify: `lessons.md`
- Modify: `findings.md`
- Modify: `progress.md`

- [x] 记录本轮三份 PRD最终口径。
- [x] 记录全模块详情弹窗规则供后续 PRD同步。
- [x] 记录主资产联动历史仍待确认。

### Task 5: 验证

- [x] 检查三份 PRD表格结构。
- [x] 检查模板列数、必填和空白处理。
- [x] 检查报废类型、报废字段、主资产联动及原子失败。
- [x] 检查身份证号码在合约号码 PRD中无展示维护残留。
- [x] 检查详情弹窗和列表状态规则。
- [x] 运行 `git diff --check`。
