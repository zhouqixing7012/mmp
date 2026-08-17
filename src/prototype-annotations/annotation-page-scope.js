export const PAGE_SCOPE_ATTRIBUTE = 'data-prototype-page-scope';
export const PAGE_LABEL_ATTRIBUTE = 'data-prototype-page-label';

export const YEWURULES_MATERIAL_COMPREHENSIVE_SCOPE =
  'route:/yewurules::后台基础配置::物料数据维护::物料维度组合';

function compact(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export function buildRoutePageScope(pathname, internalScope = '') {
  const routeScope = `route:${pathname || '/'}`;
  const inner = compact(internalScope);
  return inner ? `${routeScope}::${inner}` : routeScope;
}

export function readPrototypePageScope(pathname, root = document) {
  const scopedRoot = root?.querySelector?.(`[${PAGE_SCOPE_ATTRIBUTE}]`);
  return buildRoutePageScope(pathname, scopedRoot?.getAttribute(PAGE_SCOPE_ATTRIBUTE) || '');
}

export function readPrototypePageLabel(pathname, root = document) {
  const scopedRoot = root?.querySelector?.(`[${PAGE_SCOPE_ATTRIBUTE}]`);
  const explicitLabel = compact(scopedRoot?.getAttribute(PAGE_LABEL_ATTRIBUTE));
  if (explicitLabel) return explicitLabel;

  const internalScope = compact(scopedRoot?.getAttribute(PAGE_SCOPE_ATTRIBUTE));
  if (internalScope) {
    const parts = internalScope.split('::').filter(Boolean);
    return parts[parts.length - 1] || internalScope;
  }

  return pathname || '/';
}

export function annotationScopeFilename(scope) {
  return String(scope || 'page')
    .replace(/^route:/, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96) || 'page';
}
