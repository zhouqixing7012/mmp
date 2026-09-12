# 资产系统 B 端动效规范

> 适用范围：资产系统桌面端业务页面、个人工作台、后台管理页面及公共组件。
>
> 目标：让页面状态变化更自然、更容易理解，不做装饰性动画，不牺牲操作效率。

## 1. 核心原则

1. 动效只解释状态变化：打开、关闭、切换、展开、收起、新增、修改、悬浮、按压。
2. 高频 B 端操作必须短、轻、克制，不做明显弹跳、长距离飞入、连续摇晃。
3. 优先在公共入口实现，业务页面不得各自发明时长、缓动和动画方向。
4. 普通信息 Card、查询 Card、详情 Card、表格 Card 默认不做上浮；只有明确可点击的卡片/操作块才有 hover/press。
5. 所有动效必须兼容 `prefers-reduced-motion`，用户关闭系统动画时不得强制播放明显位移动效。
6. 当前项目优先使用 React + CSS + Ant Design / React Router 自带能力，不为简单过渡新增动画依赖。

## 2. 统一时长

全局定义在 `src/index.css`：

| Token | 时长 | 使用场景 |
|---|---:|---|
| `--mmp-motion-instant` | 100ms | 按压、极高频 hover |
| `--mmp-motion-fast` | 140ms | 遮罩、菜单、下拉、退出、查询结果刷新 |
| `--mmp-motion-normal` | 180ms | 页面进入、弹窗主体、常规切换 |
| `--mmp-motion-slow` | 220ms | 低频、内容稍复杂的进入变化 |

业务页面禁止自行出现 `duration: 0.37`、`transition: 500ms` 等随意值。

## 3. 页面切换

### 3.1 `/yewurules` 菜单 / 子菜单 / Tab 切换

后台主框架在 `AdminContent` 通过 `PageMotionBoundary` 统一处理页面进入动效：

- `opacity: 0 → 1`
- `translateY(6px) → 0`
- 约 180ms

`activeMenu / activeSubMenu / activeTab` 变化时会重新挂载统一页面出口，因此菜单、子菜单和 Tab 切换自动获得页面动效。新增 `/yewurules` 页面时只需接入现有 `AdminContent`，禁止在具体业务页面重复添加同层整页进入动画。

### 3.2 React Router 路由切换

`src/App.js` 的普通路由出口统一使用 `PageMotionBoundary`，并按 `location.key` 重新挂载。

这意味着以下方式都自动获得统一路由进入动效：

- `<Link to="/example">`
- 按钮中 `navigate('/example')`
- 其他正常 React Router 路由跳转

业务页面不需要、也不应该为了按钮跳转再单独增加一套 Cross Fade 或 `viewTransition` 参数。

`/yewurules` 不在 App 层重复播放整页动画，由内部 `AdminContent` 接管，避免双重淡入。

### 3.3 同一 URL 内部列表 / 详情 / 编辑 / 创建切换

很多 B 端页面不会改变 URL，而是通过：

```jsx
const [view, setView] = useState('list');
```

在同一个组件内部切换：

```text
列表 → 详情
列表 → 编辑
列表 → 创建
详情 / 编辑 → 返回列表
```

项目通过 `src/components/PageMotionBoundary.jsx` 在页面出口统一覆盖这类场景，不要求历史业务页面逐个手工套动画组件。

`PageMotionBoundary` 使用两层判定：

1. **语义标题变化**：监听当前页面的 `h1 / h2 / h3 / h4` 与主要 `Card` 标题。
2. **主要业务区块替换**：即使标题相同，只要页面出口第一层发生包含 Card / Table / Form / Descriptions 等主要业务区块的整体替换，也视为整页业务视图切换。

以下变化不会触发整页动画：

- 普通表格行增删、查询、分页、排序。
- 输入值变化、字段校验。
- 局部提示或按钮显隐。
- Modal / Drawer / Popover / Dropdown 及项目自定义弹窗内部标题和结构变化。

#### 特殊兜底

如果两个内部视图既没有可区分标题，也没有可识别的主要业务区块替换，必须显式提供视图标识：

```jsx
<div data-page-view-key={view}>
  {view === 'list' ? <ListView /> : <EditorView />}
</div>
```

如果页面结构无法提供统一根节点，再使用：

```jsx
import PageViewMotion from '../components/PageViewMotion';

<PageViewMotion viewKey={view}>
  {view === 'list' ? <ListView /> : <EditorView />}
</PageViewMotion>
```

规则：

- 默认依赖公共 `PageMotionBoundary`，不要为了常规 list/detail/editor/create 再手写动画。
- `data-page-view-key` / `PageViewMotion` 只用于自动识别无法区分的特殊情况。
- 详情页里的局部 Tab、折叠区、字段显隐继续使用各组件原生交互，不套整页动画。

## 4. 弹窗

### 4.1 优先级

1. 优先使用 Ant Design `Modal`，沿用其原生动效。
2. 通用选择场景必须使用 `SelectModal`。
3. 只有项目现有自定义场景才使用 `src/components/Modal.js`。

`SelectModal` 和自定义 `Modal` 已统一：

- 遮罩淡入/淡出
- 主体 `translateY(8px) + scale(0.98) → 正常位置`
- 进入约 180ms
- 退出约 140ms
- 关闭动画结束后再卸载 DOM

新增弹窗禁止重新写一套 `if (!open) return null` + 瞬间插入 DOM 的自定义实现。

## 5. 侧边栏与下拉

侧边栏二级菜单统一使用 `mmp-sidebar-collapse`，顶部路由下拉统一使用 `mmp-nav-dropdown`。

规则：

- 展开/收起只使用短距离和透明度变化。
- Chevron 旋转使用统一 `mmp-menu-chevron`。
- 不允许菜单从屏幕外飞入。
- 关闭状态必须禁止点击，不能只把透明度设为 0。

业务页面如果需要自定义轻量下拉，应优先使用 Ant Design `Dropdown / Popover`；确实需要手写时复用上述动效语义，不新造时长。

## 6. 可点击 Card / 操作块

只有明确可点击对象使用：

```jsx
<div className="mmp-interactive-card ...">
  ...
</div>
```

当前效果：

- hover：上浮 2px + 阴影略增强
- active：回落并 `scale(0.99)`
- 100～140ms

禁止给以下对象添加上浮：

- 查询条件 Card
- 详情信息 Card
- 表格容器 Card
- 审批记录 Card
- 仅用于分区的 Card

判断标准：如果用户点击 Card 本身不会触发业务动作，就不要加 `mmp-interactive-card`。

## 7. 表格新增 / 修改反馈

新增或修改一条记录后，如果用户会回到列表查找结果，应短暂高亮目标行。

公共 Hook：

```jsx
import useTransientRowHighlight from '../hooks/useTransientRowHighlight';

const { highlightRow, getRowClassName } = useTransientRowHighlight();
```

Table：

```jsx
<Table
  rowKey="id"
  rowClassName={(record) => getRowClassName(record, 'id')}
  ...
/>
```

成功新增/修改后：

```jsx
setRows((current) => [created, ...current]);
highlightRow(created.id);
```

修改：

```jsx
setRows((current) => current.map((row) => row.id === updated.id ? updated : row));
highlightRow(updated.id);
```

规则：

- 只在成功落数据后触发，不在点击按钮时提前触发。
- 默认约 900ms，由浅品牌色自然恢复，不闪烁、不循环。
- 删除不做“残影动画”，删除成功后直接移除并用 Message 反馈。
- 查询、分页、排序导致的普通列表刷新不触发行高亮。

### 7.1 查询 / 重置结果反馈

查询列表点击“查询”或“重置”后，不做整页页面动效，也不人为制造 Loading。统一由公共 `QueryBar` 给当前查询区后面的首个结果 `Table / List` 一次短刷新反馈：

- 约 140ms。
- `opacity: 0.45 → 1`。
- `translateY(2px) → 0`。
- 查询和重置使用同一反馈。
- 默认按钮和 `buttons` 自定义的“查询 / 重置”按钮都应自动覆盖。
- 查询条件 Card 本身保持静止，避免用户误以为整个页面重新加载。
- `prefers-reduced-motion` 下压缩到近乎即时。

如果一个查询区对应的结果不是普通 Ant Design `Table / List`，可在结果根节点增加：

```jsx
<div data-mmp-query-result>
  ...
</div>
```

不要为了表现“正在查询”增加固定延时或假的 `Spin / Skeleton`；只有真实异步等待才显示 Loading。

## 8. Hover / Press

高频控件优先使用 Ant Design 原生状态；手写交互只允许针对明确属性：

推荐：

```css
transition: color 140ms, background-color 140ms, transform 100ms;
```

不推荐：

```css
transition: all 300ms;
```

原因：`transition-all` 会把尺寸、位置等无关变化也纳入动画，容易让后台页面拖沓或出现意外过渡。

## 9. Loading 与内容替换

- 有真实异步等待时优先使用 Ant Design `Skeleton / Spin`。
- Skeleton → 内容可以做轻量淡入，但不要为了演示 Mock 数据人为制造 Loading。
- 不允许为了“看起来高级”加入固定延时。

## 10. 禁止项

新增页面禁止：

- 大于 300ms 的常规业务动画。
- `bounce / spring` 弹跳作为普通后台交互默认效果。
- 页面从左右 100px 以上距离飞入。
- 普通信息 Card 全局上浮。
- 为单个页面单独引入 GSAP、Motion 等动画依赖。
- 在业务页面复制一套新的动效 Token。
- 使用动画掩盖慢接口；真实性能问题应直接解决性能。

## 11. 新页面动效检查清单

每次生成新页面必须检查：

1. 菜单 / Tab 页面是否接入现有 `AdminContent + PageMotionBoundary`，而不是自己再做同层整页动画。
2. React Router 路由跳转是否直接使用现有 App 路由出口，不重复加动画。
3. 同 URL 内列表 / 详情 / 编辑 / 创建 / 返回是否能被“语义标题变化”或“主要业务区块替换”识别；两者都无法区分时才补 `data-page-view-key` 或 `PageViewMotion`。
4. 弹窗是否使用 Ant Design Modal / `SelectModal` / 现有公共 Modal。
5. 明确可点击 Card 是否使用 `mmp-interactive-card`；不可点击 Card 是否保持静止。
6. 有“新增/修改后回列表”场景时，是否使用 `useTransientRowHighlight` 给目标行反馈。
7. 使用 `QueryBar` 的查询列表是否保留公共“查询 / 重置 → 结果区 140ms 刷新反馈”，而不是自行做整页动画或假 Loading。
8. 自定义菜单/下拉是否有 140～180ms 的进入/退出，而不是瞬间出现。
9. 是否避免 `transition-all`、长动画和大位移。
10. 是否尊重 `prefers-reduced-motion`。
11. 是否没有为了动效新增不必要的依赖。
12. 打开 Modal / Drawer / Popover / Dropdown 时，是否不会误触发整页页面动效。

只要以上 12 项满足，新页面就视为符合本项目统一动效规范。
