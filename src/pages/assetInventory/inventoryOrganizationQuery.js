// 组织树只使用当前资产中的公司与部门路径，不补造组织资料。
export function buildInventoryOrganizationTree(assets) {
  const companies = new Map();
  assets.forEach(({ organization, ownerDept }) => {
    if (!organization) return;
    if (!companies.has(organization)) companies.set(organization, { title: organization, value: `org:${organization}`, children: [] });
    let children = companies.get(organization).children;
    const parts = String(ownerDept || '').split('.').filter(Boolean);
    parts.forEach((title, index) => {
      const value = `dept:${organization}::${parts.slice(0, index + 1).join('.')}`;
      let node = children.find((item) => item.value === value);
      if (!node) { node = { title, value, children: [] }; children.push(node); }
      children = node.children;
    });
  });
  return [...companies.values()];
}

export function matchesInventoryOrganization(asset, selected = []) {
  if (!selected.length) return true;
  return selected.some((choice) => {
    if (choice.startsWith('org:')) return asset.organization === choice.slice(4);
    if (!choice.startsWith('dept:')) return false;
    const [organization, department] = choice.slice(5).split('::');
    return asset.organization === organization && (asset.ownerDept === department || String(asset.ownerDept || '').startsWith(`${department}.`));
  });
}
