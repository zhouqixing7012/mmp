# 当前状态

- 项目为企业资产管理产品演示前端，继续直接在 `main` 迭代；不新建分支或 worktree，除非用户明确要求。
- 当前阶段：个人工作台、资产管理、库存管理主要原型已建立，后续继续按截图和 PRD 逐页校准。
- 2026-08-17 已将附件 `员工自助功能PRD.pdf` 按业务模块转换为 Markdown，新增 `docs/员工自助功能PRD/`；资产申请因内容较长再按流程拆为 3 个子文件。
- 2026-08-17 已完成原型标注层升级：保留 `data-prototype-anchor`，新增可配置位置、滚动跟随、尺寸跟随、边缘自动翻转和视口约束。

# 上次停留位置

- `员工自助功能PRD.pdf` 已完成模块化 Markdown 拆分；后续需要查原始需求时优先从 `docs/员工自助功能PRD/README.md` 进入对应模块。
- 原型标注能力已升级并写入 `main`；下一次涉及页面标注时，直接在业务页面增加语义化 `data-prototype-anchor`，在 `src/prototype-annotations/annotation-data.js` 配置标注内容和 `position`。

# 近期关键决定

- 本次 PRD 转换保留原 PDF 页码标记、文字、字段表和业务规则；原 PDF 页面截图/流程图不单独导出为图片。
- 现有 `docs/PRD-EMPLOYEE-ASSET-SELF-SERVICE*.md` 属于项目迭代实现口径，本次不覆盖，原始附件拆分版独立放入 `docs/员工自助功能PRD/`。
- 标注数据与业务页面解耦：业务页面不保存 x/y 坐标，只声明 DOM 锚点。
- 标注位置统一支持 `side / align / gap / offsetX / offsetY / viewportPadding`。
- 定位层统一处理屏幕边缘翻转和可视区域约束，不在业务页面写定位补丁。
- `MutationObserver` 只监听 DOM 增删；滚动、窗口变化和元素尺寸变化由独立监听处理，避免全量属性监听造成重复刷新。
- 本次不新增第三方运行时依赖，保持现有安装、构建和部署链不变。

# 当前全局设计规范

- PC 业务页使用单层画布；页面标题用 `Typography.Title level={4}`；蓝色竖块只用于业务 Card 标题。
- 业务分区使用 `Card size="small"`；详情优先 `DetailGrid + DetailItem`；列表使用 small bordered Table。
- 只读字段展示文本或 `StatusTag`；只有真实可编辑字段使用 Input / Select / DatePicker / TextArea。
- 查询区域优先复用 `QueryBar / QueryItem`；选择类字段优先复用 `SelectModal`。
- 空值显示 `-`；公司/板块分开；部门用 `.` 连接。
- 员工确认全面取消电子签，统一刷卡/员工工号 + 狐小 e 扫码。
- “查看名下资产”统一使用眼睛图标 + 蓝色 link Button。
- 未确认字段不补造；截图只用于确认业务内容，视觉按当前项目规范重构。

# 当前模块状态

- 个人工作台：资产申请、审批、配给、领用、借用、更换、退库、合约号码相关主链路已建立。
- 资产管理：资产维护、耗材维护、合约号码维护、标签打印、跨公司转移、资产报废、账面报废、资产处置、员工资产信息查询已建立。
- 库存管理：资产接收、入库、出库、移库、转移、库管员工作台已有主要原型；耗材接收及部分新建/详情页继续按后续字段补充。
- 原型标注：当前先覆盖 `/yewurules`，后续页面按同一结构扩展页面 key 和 annotation data。
