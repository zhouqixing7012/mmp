# 当前状态

项目是产品演示用的企业资产管理前端，不是生产系统。

已确认当前版本包含 `AI_RULES.md` 和 `CLAUDE.md`：
- `AI_RULES.md` 管 AI Agent 行为边界。
- `CLAUDE.md` 管项目编码约定。
- 后续任务开始前必须先读这两个文件。

# 本次完成

完成第二轮整改：建立资产申请链路的数据层样板，并修复导航收起问题。

1. 新增 `src/mock/assetApplicationMock.js`
   - 统一放置新增资产申请页使用的分类树、资产库、已有资产、申请原因。
   - 增加默认资产申请单，作为后续审批页接入同源数据的基础。

2. 新增 `src/services/demoStorage.js`
   - 统一封装 localStorage 的读、写、重置。
   - 提供资产申请数据的读取、保存、新增和重置方法。
   - 页面不再直接操作 localStorage。

3. 修改 `src/pages/zichanshenqing.js`
   - 页面内的大块 mock 数据已迁出到 `src/mock/assetApplicationMock.js`。
   - 提交审批时调用 `addAssetApplication` 写入统一演示数据。
   - 增加耗材必须关联主资产的提交校验。

4. 修改 `src/components/Navbar.js`
   - 模块菜单由受控状态管理。
   - 点击下拉菜单中的页面入口后，菜单会自动收起。

5. 更新 `ARCHITECTURE.md`
   - 补充 `src/services/` 职责。
   - 补充资产申请页、mock 数据、service 的调用关系。

# 上次停的位置

资产申请页已经接入统一演示数据服务，但审批页 `zichanshenqingshenpi.js` 还没有改为从同一份数据读取。

# 近期关键决定

- 先用“新增资产申请”作为数据层样板，不直接拆 `yewurules.js`。
- 页面组件不直接操作 localStorage，统一通过 `src/services/demoStorage.js`。
- mock 数据继续留在前端，符合产品演示项目定位。
- 导航改为受控下拉，避免点击页面后菜单仍悬浮。

# 下一步建议

下一阶段优先处理：

1. 修改 `zichanshenqingshenpi.js`，让审批页读取 `getAssetApplications()`。
2. 审批同意/驳回后，通过 service 更新同一份资产申请数据。
3. 再让 `applylist.js` 接入同源申请数据，形成“提交申请 → 申请列表 → 审批”的完整链路。
