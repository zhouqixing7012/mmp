# 当前状态

项目是产品演示用的企业资产管理前端，不是生产系统。

已确认当前版本包含 `AI_RULES.md` 和 `CLAUDE.md`：
- `AI_RULES.md` 管 AI Agent 行为边界。
- `CLAUDE.md` 管项目编码约定。
- 后续任务开始前必须先读这两个文件。

# 本次完成

完成第一轮低风险整改：

1. 修正 `README.md`
   - 技术栈改为当前真实依赖：React 19、React Router 7、Ant Design 6、Create React App。
   - 增加当前模块说明、整改记录、开发约定和搜索记录。

2. 新增 `ARCHITECTURE.md`
   - 说明顶层文件职责。
   - 说明 `src/` 下主要目录职责。
   - 说明 `App.js`、`routes.js`、`Navbar.js` 的调用关系。

3. 整理 `src/config/routes.js`
   - 为路由增加 `group` 字段。
   - 导出 `routeGroups` 和 `navGroups`。
   - 保留原有路径和页面组件，不删除现有页面。

4. 整理 `src/components/Navbar.js`
   - 顶部导航从所有页面平铺改为按模块分组展示。
   - 导航数据来自 `navGroups`，减少后续维护成本。

# 上次停的位置

第一轮结构整改已完成，尚未拆分业务页面和 mock 数据。

# 近期关键决定

- 先做低风险结构整理，不直接重构大页面。
- 不修改 `package.json`，因为 `AI_RULES.md` 已要求未经明确允许不改构建工具和依赖。
- 不拆 `yewurules.js`，因为它影响范围大，需要单独作为下一阶段处理。
- 路由仍保留原路径，避免影响已有演示入口。

# 下一步建议

下一阶段优先处理：

1. 选一个页面做样板，把页面内 mock 数据迁到 `src/mock/`。
2. 建立 service 层统一读写演示数据，避免页面直接操作 localStorage。
3. 再拆 `yewurules.js`，按业务配置子模块拆分。
