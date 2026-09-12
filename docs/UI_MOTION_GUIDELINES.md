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
| `--mmp-motion-fast` | 140ms | 遮罩、菜单、下拉、退出 |
| `--mmp-motion-normal` | 180ms | 页面进入、弹窗主体、常规切换 |
| `--mmp-motion-slow` | 220ms | 低频、内容稍复杂的进入变化 |

业务页面禁止自行出现 `duration: 0.37`、`transition: 500ms` 等随意值。

## 3. 页面切换

### 3.1 `/yewurules` 菜单 / 子菜单 / Tab 切换

后台主框架已经在 `AdminContent` 按 `activeMenu / activeSubMenu / activeTab` 统一处理页面进入动效：

- `opacity: 0 → 1`
- `translateY(6px) → 0`
- 约 180ms

新增 `/yewurules` 页面时只需接入现有 `AdminContent`，禁止在具体页面重复添加同层整页进入动画。

### 3.2 React Router 路由切换

`src/App.js` 的路由出口统一按 `location.key` 触发 `mmp-page-motion`。

这意味着以下方式都自动获得统一路由进入动效：

- `<Link to="/example">`
- 按钮中 `navigate('/example')`
- 其他正常 React Router 路由跳转

业务页面不需要、也不应该为了按钮跳转再单独增加一套 Cross Fade 或 `viewTransition` 参数。

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

这类变化不会触发路由出口，也不会触发 `AdminContent` 的菜单级动效，必须使用公共组件：

```jsx
import PageViewMotion from '../components/PageViewMotion';

<PageViewMotion viewKey={view}>
  {view === 'list' ? <ListView /> : <EditorView />}
</PageViewMotion>
```

`PageViewMotion` 复用现有 `mmp-page-motion`，不创建新的时长和曲线。

规则：

- 只用于“整块业务视图替换”，不是普通字段显隐。
- `viewKey` 必须真实对应当前视图状态，如 `list / detail / editor / create`。
- 点击“查看 / 编辑 / 创建 / 返回”导致整页区域变化时必须接入。
- 不允许因为 URL 没变化就瞬间替换整个页面。
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

1. 菜单 / Tab 页面是否接入现有 `AdminContent`，而不是自己再做同层整页动画。
2. React Router 路由跳转是否直接使用现有全局路由出口，不重复加动画。
3. 同 URL 内通过按钮执行列表 / 详情 / 编辑 / 创建 / 返回切换时，是否使用 `PageViewMotion`。
4. 弹窗是否使用 Ant Design Modal / `SelectModal` / 现有公共 Modal。
5. 明确可点击 Card 是否使用 `mmp-interactive-card`；不可点击 Card 是否保持静止。
6. 有“新增/修改后回列表”场景时，是否使用 `useTransientRowHighlight` 给目标行反馈。
7. 自定义菜单/下拉是否有 140～180ms 的进入/退出，而不是瞬间出现。
8. 是否避免 `transition-all`、长动画和大位移。
9. 是否尊重 `prefers-reduced-motion`。
10. 是否没有为了动效新增不必要的依赖。

只要以上 10 项满足，新页面就视为符合本项目统一动效规范。
