const importedPhotoRecords = [];

function normalizeBaseName(fileName) {
  const name = String(fileName || '').trim();
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.slice(0, dotIndex).trim() : name;
}

export function parseInventoryPhotoFileName(fileName) {
  const baseName = normalizeBaseName(fileName);
  const roleMatch = baseName.match(/^(.*?)[_-](整体|部分|局部)$/);
  if (!roleMatch) {
    return { assetTag: baseName, photoType: 'overall' };
  }
  return {
    assetTag: roleMatch[1].trim(),
    photoType: roleMatch[2] === '整体' ? 'overall' : 'partial',
  };
}

export function importInventoryPhotoFiles({ projectNo, files, assets }) {
  const assetMap = new Map((assets || []).map((asset) => [String(asset.assetTag || '').trim(), asset]));
  const matched = [];
  const unmatched = [];
  const invalid = [];

  Array.from(files || []).forEach((file) => {
    if (!file.type?.startsWith('image/')) {
      invalid.push(file.name);
      return;
    }

    const { assetTag, photoType } = parseInventoryPhotoFileName(file.name);
    const asset = assetMap.get(assetTag);
    if (!asset) {
      unmatched.push(file.name);
      return;
    }

    const existingIndex = importedPhotoRecords.findIndex((record) => (
      record.projectNo === projectNo
      && record.assetTag === assetTag
      && record.photoType === photoType
    ));
    const src = URL.createObjectURL(file);
    const record = {
      key: `${projectNo || 'project'}-${assetTag}-${photoType}`,
      projectNo: projectNo || '',
      assetTag,
      assetKey: asset.key,
      photoType,
      fileName: file.name,
      src,
      importedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      const previous = importedPhotoRecords[existingIndex];
      if (previous?.src?.startsWith('blob:')) URL.revokeObjectURL(previous.src);
      importedPhotoRecords.splice(existingIndex, 1, record);
    } else {
      importedPhotoRecords.push(record);
    }
    matched.push(record);
  });

  return { matched, unmatched, invalid };
}

export function getImportedInventoryPhotos(projectNo) {
  return importedPhotoRecords
    .filter((record) => !projectNo || record.projectNo === projectNo)
    .map((record) => ({ ...record }));
}
