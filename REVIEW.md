# 研发评审分支说明

当前分支：`review/rd-review`

## 用途

本分支只保存阶段性已经确认、准备交给研发评审的 PRD 与原型结论。`main` 继续用于日常产品迭代，本分支不会自动跟随 `main`。

## 后续手动同步流程

1. 先在 `main` 完成 PRD / 原型修改并确认结论。
2. 只把本次准备交付研发的改动同步到 `review/rd-review`。
3. 更新 `src/review/review-release.js`：
   - 修改 `version`；
   - `prdChanges` 只写本次 PRD 变化；
   - `prototypeChanges` 只写本次原型变化。
4. 提交评审分支并等待 Vercel Preview 构建成功。
5. 将该 Preview 地址发给研发评审。

## 页面更新通知

评审分支启动后会展示“研发评审版本更新说明”弹窗。弹窗不自动分析 Git 差异，内容以 `review-release.js` 中人工确认的变化为唯一来源，避免把尚未确认的 `main` 修改误带给研发。
