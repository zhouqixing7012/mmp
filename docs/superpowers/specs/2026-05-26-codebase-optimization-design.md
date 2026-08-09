# Codebase Optimization Design

**Date:** 2026-05-26
**Project:** asset-scrap-react
**Scope:** Code quality and maintainability improvements (conservative + selected structural changes)

---

## 1. Summary

Optimize the existing `asset-scrap-react` codebase — a React asset management SPA using Tailwind CSS and React Router. The goal is to reduce duplication, centralize design tokens, standardize icon usage, and extract reusable UI primitives, while preserving the existing Ant Design-inspired enterprise UI style.

---

## 2. Changes

### 2.1 Icon Unification (lucide-react)

**Problem:** 6+ pages define identical SVG icon components inline (`IconX`, `IconTrash2`, `IconChevronRight`, `IconCheckCircle`, `IconAlertCircle`, etc.), leading to hundreds of lines of duplicated code. Behavior and styling vary slightly across files.

**Solution:** Replace all hand-written SVG icon components with `lucide-react` imports. `lucide-react` (v1.11.0) is already a project dependency — no install needed.

**Scope:**
- Every file that currently defines `const Icon* = (...) => (...)` inline will be updated to import from `lucide-react` instead.
- **Exemptions** (custom icons not available in lucide): `IconUnlink` and `IconExchange` in `主备维护主编辑页.js` — these are bespoke designs and will remain as inline SVGs, clearly commented.

**Mapping:**
| Current | lucide-react |
|---|---|
| `IconX` | `X` |
| `IconUpload` | `Upload` |
| `IconTrash2` | `Trash2` |
| `IconChevronRight` | `ChevronRight` |
| `IconChevronDown` | `ChevronDown` |
| `IconPlus` | `Plus` |
| `IconCheckCircle` | `CheckCircle` |
| `IconAlertCircle` | `AlertCircle` |
| `IconSearch` | `Search` |
| `IconPaperclip` | `Paperclip` |
| `IconFileText` | `FileText` |
| `IconCamera` | `Camera` |
| `IconImage` | `Image` |
| `IconArrowRight` | `ArrowRight` |
| `IconEye` | `Eye` |
| `IconDownload` | `Download` |

**Files affected:** ~8 pages + any additional files with inline icon definitions. Each import replaces ~5-15 lines of SVG with a single import line.

### 2.2 Tailwind Theme Configuration

**Problem:** Design tokens (`#1677ff`, `#f0f0f0`, `rgba(0,0,0,0.88)`, etc.) are scattered across inline arbitrary values in every file. Changes require searching and replacing across the entire codebase.

**Solution:** Extend `tailwind.config.js` with semantic color tokens:

```js
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
```

**Usage change:** `text-[rgba(0,0,0,0.88)]` → `text-text-primary`, `border-[#f0f0f0]` → `border-border`, etc.

**Out of scope for this pass:** Updating every single inline color reference across all pages. Only the most-visited / most-modified pages will be updated to use the new tokens. Other pages will be migrated incrementally as they are touched.

### 2.3 Common UI Components

#### 2.3.1 `<Modal>` Component

**Problem:** Every page that uses a modal dialog duplicates the same structure:
```html
<div class="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-[1000] flex items-center justify-center p-4">
  <div class="bg-white rounded-lg shadow-[...] max-w-[520px] overflow-hidden">
    <div class="px-6 py-4 border-b ...">title + X button</div>
    <div class="p-6">body content</div>
    <div class="px-6 py-3.5 border-t ...">cancel + confirm buttons</div>
  </div>
</div>
```

This pattern appears 3+ times in `主备维护主编辑页.js` alone, plus across other pages.

**Solution:** Create `src/components/Modal.js`:

```jsx
// Props:
//   isOpen, onClose, title, children,
//   footer (optional, defaults to Cancel + Confirm buttons)
//   width (optional, default 'max-w-[520px]')
//   confirmText, onConfirm, confirmDisabled (shorthand when no custom footer needed)

<Modal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  title="新增主资产"
  onConfirm={handleConfirm}
  confirmDisabled={!selectedItem}
>
  {/* body content */}
</Modal>
```

#### 2.3.2 `<FormField>` Component

**Problem:** Each form label + required-star + input/select combo repeats the same layout pattern:
```jsx
<label>
  <span className="text-[#ff4d4f] font-family-[SimSun] mr-1">*</span>字段名称
</label>
<select className="w-full border border-[#d9d9d9] rounded-md h-8 px-3 ..." />
```

**Solution:** Create `src/components/FormField.js`:

```jsx
// Props:
//   label, required (boolean), children

<FormField label="选择基础资产数据" required>
  <select ... />
</FormField>
```

This eliminates the `font-family-[SimSun]` invalid class, centralizes required-star styling, and provides consistent spacing.

### 2.4 Route Configuration Centralization

**Problem:** Both `App.js` (Routes) and `Navbar.js` (link list) maintain separate copies of the same route information. Adding a new page requires editing two files. Also, import variable names are inconsistent (some English, some Chinese).

**Solution:** Create `src/config/routes.js`:

```js
export const routes = [
  { path: '/',            name: '报废申请单',          component: 'ScrapForm',          nav: true },
  { path: '/approval',    name: '账面报废审批',         component: 'ApprovalPage',       nav: true },
  // ... all routes
];
```

**Changes in `App.js`:** Import routes config, map into `<Route>` elements programmatically.

**Changes in `Navbar.js`:** Import routes config, filter `nav: true`, render `<Link>` elements.

**Import note:** Each page's `export default function App()` must be renamed to match the component field above (e.g., `export default function ScrapForm()`). This affects ~19 files and is necessary for both DevTools clarity and route config mapping.

### 2.5 App.css Cleanup

**Problem:** `App.css` contains only CRA boilerplate (`App-logo-spin`, `.App-header`) that is dead code — Tailwind handles all styling.

**Solution:** Delete `src/App.css` entirely. Remove any `import './App.css'` from the codebase.

### 2.6 File Renaming (Chinese → English)

**Motivation:** Chinese filenames cause issues with URL encoding in browser devtools, cross-platform git (encoding issues on some filesystems), and make import paths harder to read for non-Chinese-speaking developers.

**Proposed mapping (key pages):**

| Current | Proposed |
|---|---|
| `主备维护主编辑页.js` | `MainSpareEdit.js` |
| `主备维护备件编辑页.js` | `MainSparePartEdit.js` |
| `主备维护审批页.js` | `MainSpareApproval.js` |
| `信息变更编辑页.js` | `InfoChangeEdit.js` |
| `位置变更审批页.js` | `PositionChangeApproval.js` |
| `序列号变更编辑页.js` | `SerialNumberEdit.js` |
| `序列号变更审批页.js` | `SerialNumberApproval.js` |
| `责任人变更编辑页.js` | `ResponsiblePersonEdit.js` |
| `责任人变更接收人确认——审批.js` | `ResponsiblePersonReceiverApproval.js` |
| `责任人变更实物确认——审批.js` | `ResponsiblePersonPhysicalApproval.js` |
| `报废申请单——内审.js` | `ScrapInternalReview.js` |
| `报废申请单——采购（1）.js` | `ScrapProcurement1.js` |
| `报废申请单——采购（2）.js` | `ScrapProcurement2.js` |
| `报废申请单——采购（3）.js` | `ScrapProcurement3.js` |
| `报废申请单——采购（4）.js` | `ScrapProcurement4.js` |
| `账面报废申请单——编辑页.js` | `ScrapForm.js` |
| `账面报废申请单——审批.js` | `ScrapApproval.js` |
| `采购订单编辑页.js` | `PurchaseOrderEdit.js` |
| `机房资产看板.js` | `AssetDashboard.js` |
| `机房资产看板app.js` | `AssetDashboardMobile.js` |
| `机房资产管理.js` | `AssetManagement.js` |
| `机房资产维护查询列表.js` | `AssetMaintenanceList.js` |
| `机房资产维护查询列表（员工端）.js` | `AssetMaintenanceListEmployee.js` |
| `域名&证书查询列表.js` | `DomainCertList.js` |
| `PCS看板.js` | `PCSDashboard.js` |
| `PCS看板 副本.js` | `PCSDashboard2.js` |
| `信息变更编辑页 copy.js` | (unchanged, candidate for deletion) |
| `ApprovalPage.js` | (keep as-is, already English) |
| `ScrapForm.js` | (keep as-is) |

### 2.7 Export Name Standardization

**Problem:** 19 files use `export default function App()` — all components appear as `<App>` in React DevTools.

**Solution:** Each page will be renamed to match its functionality:
- `主备维护主编辑页.js` → `export default function MainSpareEdit()`
- `报废申请单——内审.js` → `export default function ScrapInternalReview()`
- etc.

This is done in conjunction with renaming, as the file move gives us a natural point to also rename the export.

---

## 3. Files Changed

| File | Action | Reason |
|---|---|---|
| `tailwind.config.js` | Modify | Add semantic color tokens |
| `src/App.css` | Delete | Dead CRA boilerplate |
| `src/App.js` | Modify | Use route config, update imports |
| `src/components/Navbar.js` | Modify | Use route config |
| `src/components/Modal.js` | **Create** | Common modal dialog |
| `src/components/FormField.js` | **Create** | Form field wrapper |
| `src/config/routes.js` | **Create** | Centralized route definitions |
| `src/pages/*` (19 files) | Rename & modify | English names + export rename + lucide imports |
| `src/pages/信息变更编辑页 copy.js` | Delete (candidate) | Duplicate copy |
| `src/index.js` | Modify (if imports App.css) | Remove dead import |

---

## 4. Non-Goals (Out of Scope)

- No third-party library additions beyond what's already installed
- No state management library (Redux, Zustand, etc.)
- No API layer abstraction (keeps existing mock data pattern)
- No testing infrastructure changes
- No build tool changes (stays with react-scripts 5)
- No TypeScript migration
- No CSS module migration (stays with Tailwind utility classes)
- No comprehensive color token migration across ALL files — only high-traffic pages

---

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| lucide icon names differ from custom SVG names | Pre-built mapping table (Section 2.1); verify rendering per page |
| Renamed files break git history for open PRs | Coordinate rename when no active branches; use `git mv` |
| Removed `App.css` import breaks something | Grep codebase for any `.App-` class usage before deleting |
| Route config changes break navigation | Verify every route renders correctly after refactor |
