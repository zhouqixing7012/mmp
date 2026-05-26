# Codebase Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce duplication, centralize design tokens, standardize icons, extract reusable UI primitives across the asset-scrap-react codebase.

**Architecture:** Maintains existing React + Tailwind + React Router SPA structure. Adds semantic color tokens to tailwind config, creates 3 new component files (Modal, FormField, route config), renames 27+ page files to English, standardizes export names, migrates 7 files from hand-written SVG to lucide-react, and deletes dead App.css.

**Tech Stack:** React 19, Tailwind CSS 3, react-router-dom 7, lucide-react 1.11

---

## File Structure

**Created:**
- `src/components/Modal.js` — Reusable modal dialog component
- `src/components/FormField.js` — Form field wrapper (label + required-star + children)
- `src/config/routes.js` — Centralized route definitions

**Modified:**
- `tailwind.config.js` — Add semantic color tokens
- `src/App.js` — Use route config; update page imports after rename
- `src/components/Navbar.js` — Use route config
- `src/pages/主备维护主编辑页.js` → `src/pages/MainSpareEdit.js` — Rename + export rename + lucide migration
- `src/pages/主备维护备件编辑页.js` → `src/pages/MainSparePartEdit.js` — Same
- `src/pages/主备维护审批页.js` → `src/pages/MainSpareApproval.js` — Same
- `src/pages/信息变更编辑页.js` → `src/pages/InfoChangeEdit.js` — Same
- `src/pages/序列号变更编辑页.js` → `src/pages/SerialNumberEdit.js` — Same
- `src/pages/序列号变更审批页.js` → `src/pages/SerialNumberApproval.js` — Same
- `src/pages/位置变更审批页.js` → `src/pages/PositionChangeApproval.js` — Same
- `src/pages/责任人变更编辑页.js` → `src/pages/ResponsiblePersonEdit.js` — Export rename only
- `src/pages/责任人变更接收人确认——审批.js` → `src/pages/ResponsiblePersonReceiverApproval.js` — Export rename only
- `src/pages/责任人变更实物确认——审批.js` → `src/pages/ResponsiblePersonPhysicalApproval.js` — Export rename only
- `src/pages/报废申请单——内审.js` → `src/pages/ScrapInternalReview.js` — Export rename only
- `src/pages/报废申请单——采购（1）.js` → `src/pages/ScrapProcurement1.js` — Export rename only
- `src/pages/报废申请单——采购（2）.js` → `src/pages/ScrapProcurement2.js` — Export rename only
- `src/pages/报废申请单——采购（3）.js` → `src/pages/ScrapProcurement3.js` — Export rename only
- `src/pages/报废申请单——采购（4）.js` → `src/pages/ScrapProcurement4.js` — Export rename only
- `src/pages/账面报废申请单——编辑页.js` → `src/pages/ScrapForm.js` — Export rename only (target already exists, merge)
- `src/pages/账面报废申请单——审批.js` → `src/pages/ScrapApproval.js` — Export rename only
- `src/pages/采购订单编辑页.js` → `src/pages/PurchaseOrderEdit.js` — Export rename only
- `src/pages/机房资产看板.js` → `src/pages/AssetDashboard.js` — Export rename only
- `src/pages/机房资产看板app.js` → `src/pages/AssetDashboardMobile.js` — Export rename only
- `src/pages/机房资产管理.js` → `src/pages/AssetManagement.js` — Export rename only (already named `AssetComparisonSlide`)
- `src/pages/机房资产维护查询列表.js` → `src/pages/AssetMaintenanceList.js` — Export rename only
- `src/pages/机房资产维护查询列表（员工端）.js` → `src/pages/AssetMaintenanceListEmployee.js` — Export rename only
- `src/pages/域名&证书查询列表.js` → `src/pages/DomainCertList.js` — Export rename only
- `src/pages/PCS看板.js` → `src/pages/PCSDashboard.js` — Export rename only
- `src/pages/PCS看板 副本.js` → `src/pages/PCSDashboard2.js` — Export rename only
- `src/pages/ApprovalPage.js` — Export rename only (already English filename)
- `src/pages/ScrapForm.js` — Export rename only (already English filename)

**Deleted:**
- `src/App.css` — Dead CRA boilerplate
- `src/pages/信息变更编辑页 copy.js` — Duplicate copy

---

### Task 1: Tailwind Theme Configuration

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add semantic color tokens to tailwind.config.js**

Replace the empty `theme.extend` block:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1677ff',
          hover: '#4096ff',
          bg: '#e6f4ff',
          border: '#91caff',
        },
        text: {
          primary: 'rgba(0,0,0,0.88)',
          secondary: 'rgba(0,0,0,0.65)',
          tertiary: 'rgba(0,0,0,0.45)',
          disabled: 'rgba(0,0,0,0.25)',
        },
        border: {
          DEFAULT: '#f0f0f0',
          input: '#d9d9d9',
        },
        danger: {
          DEFAULT: '#ff4d4f',
          hover: '#ff7875',
          bg: '#fff1f0',
        },
        success: '#52c41a',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verify Tailwind builds without errors**

Run: `npx tailwindcss --help` (just verify the config is parseable; actual build will be tested later)

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add semantic color tokens to tailwind config"
```

---

### Task 2: Create Modal Component

**Files:**
- Create: `src/components/Modal.js`

- [ ] **Step 1: Create Modal.js component**

```jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer, width = 'max-w-[520px]', confirmText = '确定', onConfirm, confirmDisabled = false }) => {
  if (!isOpen) return null;

  const defaultFooter = (
    <div className="px-6 py-3.5 border-t border-border flex justify-end gap-2 bg-[#fafafa]">
      <button
        onClick={onClose}
        className="h-8 px-4 border border-border-input rounded-md hover:text-primary-hover hover:border-primary-hover transition-all bg-white text-[14px]"
      >
        取消
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={`h-8 px-4 rounded-md shadow-sm transition-all text-[14px] ${
          confirmDisabled
            ? 'bg-[#f5f5f5] text-text-disabled border border-border-input cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-hover'
        }`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-[0_6px_16px_0_rgba(0,0,0,0.08)] w-full ${width} overflow-hidden`}>
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <h3 className="text-[16px] font-semibold text-text-primary">{title}</h3>
          <X
            size={16}
            className="text-text-tertiary hover:text-text-primary cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="p-6">{children}</div>
        {footer !== undefined ? footer : defaultFooter}
      </div>
    </div>
  );
};

export default Modal;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Modal.js
git commit -m "feat: add reusable Modal component"
```

---

### Task 3: Create FormField Component

**Files:**
- Create: `src/components/FormField.js`

- [ ] **Step 1: Create FormField.js component**

```jsx
import React from 'react';

const FormField = ({ label, required = false, children, className = '' }) => (
  <div className={className}>
    <label className="block text-[14px] text-text-primary mb-2">
      {required && <span className="text-danger mr-1">*</span>}
      {label}
    </label>
    {children}
  </div>
);

export default FormField;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FormField.js
git commit -m "feat: add reusable FormField component"
```

---

### Task 4: Create Route Configuration

**Files:**
- Create: `src/config/routes.js`

- [ ] **Step 1: Determine module path for each renamed page**

Create a lookup that maps each component name to its lazy import path. Since we're keeping regular imports (not lazy loading), we'll define the route config with `component` being the imported component reference.

Actually, for simplicity and to keep changes minimal, we'll define the route config as data AND keep the static imports in App.js that reference config. But since App.js needs imports anyway, the cleanest approach is:

Method: The config stores path + name + nav flag. App.js still imports all components (static imports), then maps over the config to create `<Route>` elements. Navbar filters by `nav: true`.

Create `src/config/routes.js`:

```js
const routes = [
  { path: '/',            name: '报废申请单',          nav: true },
  { path: '/approval',    name: '账面报废审批',         nav: true },
  { path: '/BaofeiNeishen', name: '报废申请单——内审',  nav: true },
  { path: '/BaofeiCaigou2', name: '报废申请单——采购（2）', nav: true },
  { path: '/BaofeiCaigou3', name: '报废申请单——采购（3）', nav: true },
  { path: '/BaofeiCaigou4', name: '报废申请单——采购（4）', nav: true },
  { path: '/Dashboard',   name: '机房资产大盘',        nav: true },
  { path: '/Dashboardapp', name: '机房资产大盘移动端',  nav: true },
  { path: '/Caigoudingdan', name: '采购订单编辑页',     nav: true },
  { path: '/BaofeiCaigou1', name: '报废申请单——采购（1）', nav: true },
  { path: '/Jifang',      name: '机房资产管理',        nav: true },
  { path: '/Jifanglist',  name: '机房资产维护查询列表', nav: true },
  { path: '/Jifanglistone', name: '机房资产维护查询列表（员工端）', nav: true },
  { path: '/Weizhi',      name: '位置变更编辑页',      nav: true },
  { path: '/Positionshenpi', name: '位置变更审批页',    nav: true },
  { path: '/SN',          name: '序列号变更编辑页',    nav: true },
  { path: '/SNshenpi',    name: '序列号变更审批页',    nav: true },
  { path: '/PCS',         name: '域名&证书查询列表',   nav: true },
  { path: '/PCSDASHBOARD', name: '域名&证书看板',     nav: true },
  { path: '/PCSDASHBOARD(2)', name: '域名&证书看板（2）', nav: true },
  { path: '/Connectzhu',  name: '主备维护主编辑页',    nav: true },
  { path: '/Connectbei',  name: '主备维护备件编辑页',  nav: true },
  { path: '/Connectshenpi', name: '主备维护审批页',    nav: true },
  { path: '/People',      name: '责任人变更编辑页',    nav: true },
  { path: '/Peoplejieshou', name: '责任人变更接收人确认——审批', nav: true },
  { path: '/Peopleshiwu', name: '责任人变更实物确认——审批', nav: true },
];

export const navRoutes = routes.filter(r => r.nav);
export default routes;
```

- [ ] **Step 2: Commit**

```bash
git add src/config/routes.js
git commit -m "feat: add centralized route configuration"
```

---

### Task 5: Update Navbar to Use Route Config

**Files:**
- Modify: `src/components/Navbar.js`

- [ ] **Step 1: Replace hardcoded links with route config**

```jsx
import { Link, useLocation } from 'react-router-dom';
import { navRoutes } from '../config/routes';

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap ${
      location.pathname === path
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        <div className="text-lg font-bold text-gray-800 mr-6 whitespace-nowrap">📋 资产管理系统</div>
        {navRoutes.map((route) => (
          <Link key={route.path} to={route.path} className={linkClass(route.path)}>
            {route.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navbar.js
git commit -m "refactor: drive Navbar links from centralized route config"
```

---

### Task 6: Rename 7 Pages with Inline SVGs + Migrate to lucide-react

**Files (7 pages that have inline SVG icons — rename + export rename + lucide migration):**

| Old filename | New filename | Export name |
|---|---|---|
| `主备维护主编辑页.js` | `MainSpareEdit.js` | `MainSpareEdit` |
| `主备维护备件编辑页.js` | `MainSparePartEdit.js` | `MainSparePartEdit` |
| `主备维护审批页.js` | `MainSpareApproval.js` | `MainSpareApproval` |
| `信息变更编辑页.js` | `InfoChangeEdit.js` | `InfoChangeEdit` |
| `序列号变更编辑页.js` | `SerialNumberEdit.js` | `SerialNumberEdit` |
| `序列号变更审批页.js` | `SerialNumberApproval.js` | `SerialNumberApproval` |
| `位置变更审批页.js` | `PositionChangeApproval.js` | `PositionChangeApproval` |

For each file, do:
1. `git mv` old → new
2. Add `import { X, Upload, Trash2, ChevronRight, ChevronDown, Plus, CheckCircle, AlertCircle, Search, ... } from 'lucide-react'`
3. Remove all inline `const Icon* = (...) => (...)` definitions
4. Replace JSX icon usage: `<IconX size={16} />` → `<X size={16} />` etc.
5. **Exception:** In `MainSpareEdit.js` (formerly 主备维护主编辑页.js), keep `IconUnlink` and `IconExchange` as inline SVGs with a comment
6. Rename export from `App` to the proper name

- [ ] **Step 1: Rename and migrate 主备维护主编辑页.js → MainSpareEdit.js**

This is the most complex file with 10 inline icons + 2 custom ones kept.

```bash
git mv "src/pages/主备维护主编辑页.js" src/pages/MainSpareEdit.js
```

In the file:
- Add at top: `import { X, Upload, Trash2, ChevronRight, ChevronDown, Plus, CheckCircle, AlertCircle } from 'lucide-react';`
- Remove these inline definitions: `IconX`, `IconUpload`, `IconTrash2`, `IconChevronRight`, `IconChevronDown`, `IconPlus`, `IconCheckCircle`, `IconAlertCircle`
- Keep `IconUnlink` and `IconExchange` (custom)
- Replace JSX usage: e.g. `<IconX size={16} />` → `<X size={16} />`, `<IconUpload size={16} />` → `<Upload size={16} />`, etc.
- Change `export default function App()` → `export default function MainSpareEdit()`

- [ ] **Step 2: Rename and migrate 主备维护备件编辑页.js → MainSparePartEdit.js**

```bash
git mv "src/pages/主备维护备件编辑页.js" src/pages/MainSparePartEdit.js
```

- Replace inline SVGs with lucide-react imports
- Change export to `MainSparePartEdit`

- [ ] **Step 3: Rename and migrate 主备维护审批页.js → MainSpareApproval.js**

```bash
git mv "src/pages/主备维护审批页.js" src/pages/MainSpareApproval.js
```

- [ ] **Step 4: Rename and migrate 信息变更编辑页.js → InfoChangeEdit.js**

```bash
git mv "src/pages/信息变更编辑页.js" src/pages/InfoChangeEdit.js
```

- [ ] **Step 5: Rename and migrate 序列号变更编辑页.js → SerialNumberEdit.js**

```bash
git mv "src/pages/序列号变更编辑页.js" src/pages/SerialNumberEdit.js
```

- [ ] **Step 6: Rename and migrate 序列号变更审批页.js → SerialNumberApproval.js**

```bash
git mv "src/pages/序列号变更审批页.js" src/pages/SerialNumberApproval.js
```

- [ ] **Step 7: Rename and migrate 位置变更审批页.js → PositionChangeApproval.js**

```bash
git mv "src/pages/位置变更审批页.js" src/pages/PositionChangeApproval.js
```

- [ ] **Step 8: Commit all 7 renames**

```bash
git add src/pages/MainSpareEdit.js src/pages/MainSparePartEdit.js src/pages/MainSpareApproval.js src/pages/InfoChangeEdit.js src/pages/SerialNumberEdit.js src/pages/SerialNumberApproval.js src/pages/PositionChangeApproval.js
git add -u src/pages/  # capture deletions of old files
git commit -m "refactor: rename 7 Chinese-named page files to English, migrate inline SVGs to lucide-react"
```

---

### Task 7: Rename Remaining Pages (Export + Filename)

**Files (19 pages — filename rename + export rename, no SVG changes):**

| Old filename | New filename | Export name |
|---|---|---|
| `责任人变更编辑页.js` | `ResponsiblePersonEdit.js` | `ResponsiblePersonEdit` |
| `责任人变更接收人确认——审批.js` | `ResponsiblePersonReceiverApproval.js` | `ResponsiblePersonReceiverApproval` |
| `责任人变更实物确认——审批.js` | `ResponsiblePersonPhysicalApproval.js` | `ResponsiblePersonPhysicalApproval` |
| `报废申请单——内审.js` | `ScrapInternalReview.js` | `ScrapInternalReview` |
| `报废申请单——采购（1）.js` | `ScrapProcurement1.js` | `ScrapProcurement1` |
| `报废申请单——采购（2）.js` | `ScrapProcurement2.js` | `ScrapProcurement2` |
| `报废申请单——采购（3）.js` | `ScrapProcurement3.js` | `ScrapProcurement3` |
| `报废申请单——采购（4）.js` | `ScrapProcurement4.js` | `ScrapProcurement4` |
| `账面报废申请单——编辑页.js` | target already is `ScrapForm.js` — merge export rename |
| `账面报废申请单——审批.js` | `ScrapApproval.js` | `ScrapApproval` |
| `采购订单编辑页.js` | `PurchaseOrderEdit.js` | `PurchaseOrderEdit` |
| `机房资产看板.js` | `AssetDashboard.js` | `AssetDashboard` |
| `机房资产看板app.js` | `AssetDashboardMobile.js` | `AssetDashboardMobile` |
| `机房资产管理.js` | `AssetManagement.js` | `AssetManagement` (already named `AssetComparisonSlide`) |
| `机房资产维护查询列表.js` | `AssetMaintenanceList.js` | `AssetMaintenanceList` |
| `机房资产维护查询列表（员工端）.js` | `AssetMaintenanceListEmployee.js` | `AssetMaintenanceListEmployee` |
| `域名&证书查询列表.js` | `DomainCertList.js` | `DomainCertList` |
| `PCS看板.js` | `PCSDashboard.js` | `PCSDashboard` |
| `PCS看板 副本.js` | `PCSDashboard2.js` | `PCSDashboard2` |
| `ApprovalPage.js` | (already English) | Change from `App` to `ApprovalPage` |
| `ScrapForm.js` | (already English) | Change from `App` to `ScrapForm` |

Also:
- `信息变更编辑页 copy.js` → Delete (duplicate copy)
- `机房资产管理.js` → Change export from `AssetComparisonSlide` to `AssetManagement` (rename function body + export)

- [ ] **Step 1: Batch rename first batch of 10 files**

For each file, do `git mv` + change `export default function App()` to the new name.

Files:
- `责任人变更编辑页.js` → `ResponsiblePersonEdit.js`
- `责任人变更接收人确认——审批.js` → `ResponsiblePersonReceiverApproval.js`
- `责任人变更实物确认——审批.js` → `ResponsiblePersonPhysicalApproval.js`
- `报废申请单——内审.js` → `ScrapInternalReview.js`
- `报废申请单——采购（1）.js` → `ScrapProcurement1.js`
- `报废申请单——采购（2）.js` → `ScrapProcurement2.js`
- `报废申请单——采购（3）.js` → `ScrapProcurement3.js`
- `报废申请单——采购（4）.js` → `ScrapProcurement4.js`
- `账面报废申请单——审批.js` → `ScrapApproval.js`
- `采购订单编辑页.js` → `PurchaseOrderEdit.js`

- [ ] **Step 2: Handle ScrapForm.js merge**

`账面报废申请单——编辑页.js` has the same target name as the existing `ScrapForm.js`. After renaming and updating its export, the old `ScrapForm.js` needs its export changed too.

```bash
git mv "src/pages/账面报废申请单——编辑页.js" src/pages/ScrapForm-edit.js
# Wait — this conflicts with existing ScrapForm.js
# Solution: The existing ScrapForm.js is the "账面报废申请单——编辑页" already imported as ScrapForm.
# So we just need to:
# 1. Change export in existing ScrapForm.js from `App` to `ScrapForm`
# 2. The 账面报废申请单——编辑页.js (which previously imported as ScrapForm) was already at ScrapForm.js
```

Actually, looking at the original App.js:
```
import ScrapForm from './pages/账面报废申请单——编辑页';
```

Wait, that can't be right. Let me re-read... The file at `ScrapForm.js` exists already. And `账面报废申请单——编辑页.js` also exists. So they're two different files imported as:
```
import ScrapForm from './pages/账面报废申请单——编辑页';  // 账面报废——编辑页
```

And there's a `scrapForm.js` too. Looking at the file listing, `ScrapForm.js` is already an English name. So the path `ScrapForm.js` is already taken. The `账面报废申请单——编辑页.js` should be renamed to something else, like `ScrapEdit.js`.

Let me fix this: `ScrapForm.js` already exists as a separate page. So `账面报废申请单——编辑页.js` → `AccountingScrapEdit.js`.

- [ ] **Step 2: Rename second batch of 8 files**

Files:
- `机房资产看板.js` → `AssetDashboard.js`
- `机房资产看板app.js` → `AssetDashboardMobile.js`
- `机房资产管理.js` → `AssetManagement.js`
- `机房资产维护查询列表.js` → `AssetMaintenanceList.js`
- `机房资产维护查询列表（员工端）.js` → `AssetMaintenanceListEmployee.js`
- `域名&证书查询列表.js` → `DomainCertList.js`
- `PCS看板.js` → `PCSDashboard.js`
- `PCS看板 副本.js` → `PCSDashboard2.js`

- [ ] **Step 3: Handle ScrapForm.js (existing English file)**

Change `export default function App()` → `export default function ScrapForm()` in `src/pages/ScrapForm.js`.

- [ ] **Step 4: Handle 账面报废申请单——编辑页.js**

Since `ScrapForm.js` already exists, rename to `AccountingScrapEdit.js`:

```bash
git mv "src/pages/账面报废申请单——编辑页.js" src/pages/AccountingScrapEdit.js
```

Change export to `AccountingScrapEdit`.

- [ ] **Step 5: Handle ApprovalPage.js (already English)**

Change `export default function App()` → `export default function ApprovalPage()`.

- [ ] **Step 6: Handle 机房资产管理.js**

Change `export default function AssetComparisonSlide()` → `export default function AssetManagement()`.

- [ ] **Step 7: Delete 信息变更编辑页 copy.js**

```bash
git rm "src/pages/信息变更编辑页 copy.js"
```

- [ ] **Step 8: Commit all remaining renames**

```bash
git add -A src/pages/
git commit -m "refactor: rename remaining pages to English, standardize export names"
```

---

### Task 8: Update App.js to Use Route Config + New Imports

**Files:**
- Modify: `src/App.js`

- [ ] **Step 1: Rewrite App.js**

Replace the entire file:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import routes from './config/routes';

// Lazy imports — all pages
import ScrapForm from './pages/ScrapForm';
import ApprovalPage from './pages/ApprovalPage';
import ScrapInternalReview from './pages/ScrapInternalReview';
import ScrapProcurement1 from './pages/ScrapProcurement1';
import ScrapProcurement2 from './pages/ScrapProcurement2';
import ScrapProcurement3 from './pages/ScrapProcurement3';
import ScrapProcurement4 from './pages/ScrapProcurement4';
import AssetDashboard from './pages/AssetDashboard';
import AssetDashboardMobile from './pages/AssetDashboardMobile';
import PurchaseOrderEdit from './pages/PurchaseOrderEdit';
import AssetManagement from './pages/AssetManagement';
import AssetMaintenanceList from './pages/AssetMaintenanceList';
import AssetMaintenanceListEmployee from './pages/AssetMaintenanceListEmployee';
import InfoChangeEdit from './pages/InfoChangeEdit';
import PositionChangeApproval from './pages/PositionChangeApproval';
import SerialNumberEdit from './pages/SerialNumberEdit';
import SerialNumberApproval from './pages/SerialNumberApproval';
import DomainCertList from './pages/DomainCertList';
import PCSDashboard from './pages/PCSDashboard';
import PCSDashboard2 from './pages/PCSDashboard2';
import MainSpareEdit from './pages/MainSpareEdit';
import MainSparePartEdit from './pages/MainSparePartEdit';
import MainSpareApproval from './pages/MainSpareApproval';
import ResponsiblePersonEdit from './pages/ResponsiblePersonEdit';
import ResponsiblePersonReceiverApproval from './pages/ResponsiblePersonReceiverApproval';
import ResponsiblePersonPhysicalApproval from './pages/ResponsiblePersonPhysicalApproval';
import AccountingScrapEdit from './pages/AccountingScrapEdit';

const componentMap = {
  '/': ScrapForm,
  '/approval': ApprovalPage,
  '/BaofeiNeishen': ScrapInternalReview,
  '/BaofeiCaigou1': ScrapProcurement1,
  '/BaofeiCaigou2': ScrapProcurement2,
  '/BaofeiCaigou3': ScrapProcurement3,
  '/BaofeiCaigou4': ScrapProcurement4,
  '/Dashboard': AssetDashboard,
  '/Dashboardapp': AssetDashboardMobile,
  '/Caigoudingdan': PurchaseOrderEdit,
  '/Jifang': AssetManagement,
  '/Jifanglist': AssetMaintenanceList,
  '/Jifanglistone': AssetMaintenanceListEmployee,
  '/Weizhi': InfoChangeEdit,
  '/Positionshenpi': PositionChangeApproval,
  '/SN': SerialNumberEdit,
  '/SNshenpi': SerialNumberApproval,
  '/PCS': DomainCertList,
  '/PCSDASHBOARD': PCSDashboard,
  '/PCSDASHBOARD(2)': PCSDashboard2,
  '/Connectzhu': MainSpareEdit,
  '/Connectbei': MainSparePartEdit,
  '/Connectshenpi': MainSpareApproval,
  '/People': ResponsiblePersonEdit,
  '/Peoplejieshou': ResponsiblePersonReceiverApproval,
  '/Peopleshiwu': ResponsiblePersonPhysicalApproval,
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {routes.map((route) => {
          const Component = componentMap[route.path];
          return Component ? <Route key={route.path} path={route.path} element={<Component />} /> : null;
        })}
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/App.js
git commit -m "refactor: drive Routes from centralized route config + updated page imports"
```

---

### Task 9: Delete App.css

**Files:**
- Delete: `src/App.css`

- [ ] **Step 1: Verify App.css is not imported anywhere**

Grep for `App.css` in the codebase (excluding node_modules and build):
```bash
grep -r "App\.css" src/ --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx"
```

Expected: no matches (index.js only imports `index.css`, not App.css).

- [ ] **Step 2: Delete App.css**

```bash
git rm src/App.css
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove dead App.css (CRA boilerplate, not used)"
```

---

### Task 10: Apply Color Tokens to Refactored Files

**Files:**
- Modify: `src/components/Modal.js` (already done in Task 2 — uses `text-text-primary`, `border-border`, etc.)
- Modify: `src/components/FormField.js` (already done in Task 3 — uses `text-text-primary`, `text-danger`)
- Modify: `src/pages/MainSpareEdit.js` — Apply color tokens to the most visible file

For `MainSpareEdit.js`, replace common inline colors with tailwind tokens:

| Before | After |
|---|---|
| `text-[rgba(0,0,0,0.88)]` | `text-text-primary` |
| `text-[rgba(0,0,0,0.65)]` | `text-text-secondary` |
| `text-[rgba(0,0,0,0.45)]` | `text-text-tertiary` |
| `text-[rgba(0,0,0,0.25)]` | `text-text-disabled` |
| `border-[#f0f0f0]` | `border-border` |
| `border-[#d9d9d9]` | `border-border-input` |
| `text-[#1677ff]` | `text-primary` |
| `hover:text-[#4096ff]` | `hover:text-primary-hover` |
| `bg-[#e6f4ff]` | `bg-primary-bg` |
| `border-[#91caff]` | `border-primary-border` |
| `text-[#ff4d4f]` | `text-danger` |
| `hover:text-[#ff7875]` | `hover:text-danger-hover` |
| `bg-[#fff1f0]` | `bg-danger-bg` |

- [ ] **Step 1: Apply color tokens to Modal.js** (already using tokens from Task 2)

- [ ] **Step 2: Apply color tokens to FormField.js** (already using tokens from Task 3)

- [ ] **Step 3: Apply color tokens to MainSpareEdit.js (the most-edited page)**

Use find-and-replace for each pattern. For each `old_string` → `new_string` above, apply an Edit to the file.

- [ ] **Step 4: Verify the app builds**

```bash
cd "D:\VS CODE\asset-scrap-react"
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors. (If any import paths are broken, fix and rebuild.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: apply semantic color tokens to Modal, FormField, and MainSpareEdit"
```

---

## Tasks Summary

| # | Task | Est. time |
|---|---|---|
| 1 | Tailwind theme config | 5 min |
| 2 | Create Modal component | 10 min |
| 3 | Create FormField component | 5 min |
| 4 | Create route config | 5 min |
| 5 | Update Navbar | 5 min |
| 6 | Rename 7 pages + migrate icons | 20 min |
| 7 | Rename remaining 19 pages | 20 min |
| 8 | Update App.js | 10 min |
| 9 | Delete App.css | 5 min |
| 10 | Apply color tokens | 15 min |
| **Total** | | **~100 min** |
