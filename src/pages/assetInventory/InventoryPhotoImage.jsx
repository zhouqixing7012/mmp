import React, { forwardRef, useEffect, useState } from 'react';
import { getCapturedInventoryPhoto } from './inventoryMobilePhotoStore';

// 移动照片由同一标识读取；批量导入和原有样例仍使用其明确的图片地址。
const InventoryPhotoImage = forwardRef(function InventoryPhotoImage({ photo, alt, ...props }, ref) {
  const [source, setSource] = useState(photo?.photoId ? '' : photo?.src || '');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setError('');
    setSource(photo?.photoId ? '' : photo?.src || '');
    if (photo?.photoId) {
      getCapturedInventoryPhoto(photo.photoId).then(blob => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setSource(objectUrl);
      }).catch(reason => { if (active) setError(reason.message); });
    }
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [photo?.photoId, photo?.src]);
  if (error) return <span role="alert">{error}</span>;
  return source ? <img ref={ref} src={source} alt={alt || photo?.label || '盘点照片'} {...props} /> : <span>照片加载中</span>;
});
export default InventoryPhotoImage;
