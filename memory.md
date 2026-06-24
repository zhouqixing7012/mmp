# Memory

<!-- Long-term facts and notes go here -->

## 标注系统 (2026-06-24)

- 基于 prototype-annotation 技能搭建非侵入式标注层
- 模块：src/prototype-annotations/（annotation-data.js + Layer + Panel + hook）
- 使用：元素加 data-prototype-anchor + annotation-data.js 加数据
- 关键踩坑：visibleAnnotations 用 useMemo 从 hotspots 推导而不独立维护 state；toggle() 关闭时清理 .paf-target-highlight
- 当前试点：yewurules.js「物料综合集合」(3个标注点)
