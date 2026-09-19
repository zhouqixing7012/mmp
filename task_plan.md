# 资产盘点移动端原型任务计划

## 目标

将两份资产盘点 DOCX 归档到 `feature/asset-inventory`，并在现有 React 项目中增加可从“资产盘点”菜单打开的移动端交互原型。

## 当前阶段

执行阶段：依赖构建修复已完成，待提交并推送。

## 阶段

- [x] 需求基线与项目结构确认
- [x] 移动端原型设计确认
- [x] 编写实现计划
- [x] 归档 DOCX
- [x] 接入菜单和页面
- [x] 实现移动端交互
- [x] 测试、构建和 Review
- [x] 更新项目记录并提交

## 关键决定

- 使用 GitHub `zhouqixing7012/mmp` 的现有 `feature/asset-inventory` 分支，不创建新分支。
- 采用方案 A：在“资产盘点”菜单下新增“移动端原型”。
- 两份 DOCX 只作为需求附件原样归档；现有 PC 端 PRD 不覆盖。
- 原型只使用本地演示数据，不调用后端、不写生产数据。

## 错误记录

| 错误 | 次数 | 处理 |
|---|---:|---|
| 初始工作区不是 Git 仓库 | 1 | 从 GitHub `feature/asset-inventory` 分支检出到当前工作区 `repo/` |
| npm 默认缓存包含 root-owned 文件 | 1 | 改用 `/private/tmp/asset-inventory-npm-cache`，不修改用户目录权限 |
| npm 临时缓存中的 `cfb` tarball 完整性校验失败 | 2 | 两个独立缓存均复现，改用镜像源；不修改锁文件 |
| 临时依赖缺少 `@rc-component/pagination` | 1 | 按 Ant Design 的实际加载错误补装到本地验证环境，不写入 package-lock |
| 临时依赖树中的 `ajv` 与 `ajv-keywords` 主版本不匹配 | 1 | 当前安装为 ajv 6 + ajv-keywords 5，补齐 ajv 8 进行构建验证 |
| 旧版 `fork-ts-checker-webpack-plugin` 复用了根目录 ajv 8 | 1 | 给插件补回独立 ajv 6，保持临时验证环境的双版本依赖关系 |
| macOS 路径大小写导致 `./assetManagement` 解析到旧文件 | 1 | 将引用改为明确的 `./assetManagement/index`，不改变业务逻辑 |
| 临时依赖树导致 ESLint 插件报 `defaultMeta` | 1 | 使用 CRA 的 `DISABLE_ESLINT_PLUGIN=true` 继续验证打包编译，不改项目脚本 |
| Jest 27 无法解析 Ant Design 的 pagination locale 子路径 | 1 | 仅在新增测试文件中做虚拟 mock，不修改生产配置 |
| 组件测试首轮有 3 个测试选择器/入口错误 | 1 | 修正测试选择器和普通扫码入口，并补上扫码成功后回到资产详情的选中状态 |
| 全量测试受既有测试和临时依赖版本影响 | 1 | 组件测试 5/5 通过；全量结果为 42 个测试套件通过、4 个失败，失败未涉及本次新增原型；不修改无关业务代码 |
| 远端已有出库审批记录页缺少 Card JSX 闭合符号 | 1 | 补齐 `>`，新增页面结构回归测试，未改动业务逻辑 |
| 默认构建的临时依赖树使用了错误 Ajv 版本，且干净安装命中 cfb 1.2.2 校验异常 | 1 | 锁定 cfb 1.2.1 并同步 package-lock；干净安装和默认构建均通过 |

## 阶段记录

- DOCX 已复制到 `docs/source/`，四份源文件和归档文件的 SHA-256 已逐一核对一致。
- 移动端原型已接入“资产盘点 → 移动端原型”菜单，覆盖工作台、详情、普通扫码、快速扫描、照片模拟和报失流程。
- 原型组件测试已通过 5/5；下一步执行完整测试、构建、差异检查和提交。
- 全量测试结果为 42 个测试套件通过、4 个失败（6 个测试失败）；失败来自既有合约号码时间断言、标注面板既有断言/临时 Ant Design 依赖版本差异，以及临时 React Router 依赖版本差异。
- `DISABLE_ESLINT_PLUGIN=true npm run build` 已通过，`git diff --check` 已通过，package-lock 未被修改。
- 出库审批记录页回归测试与移动端原型测试共 6/6 通过，`DISABLE_ESLINT_PLUGIN=true npm run build` 通过，待提交并推送修复。
- 依赖修复后使用 npm 10 干净安装 1446 个依赖成功，默认 `npm run build` 通过；关键测试 6/6 通过，待提交并推送。
