import React, { useRef, useState } from 'react';
import { Button, message as antdMessage } from 'antd';
import InventoryPhotoImage from './InventoryPhotoImage';
import { saveCapturedInventoryPhoto } from './inventoryMobilePhotoStore';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';

// capture 调用移动端拍照；演示记录保存实际文件内容，不用样例照片替代。
export default function InventoryMobilePhotoSlot({ label, photo, onChange }) {
  const inputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [captureDraft, setCaptureDraft] = useState(null);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  const persistPhoto = async (file) => {
    setSaving(true);
    try { const metadata = await saveCapturedInventoryPhoto(file, label); onChange(metadata); setCaptureDraft(null); }
    catch (error) { messageApi.warning(error.message); }
    finally { setSaving(false); }
  };
  const capturePhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { messageApi.warning('请拍摄图片文件'); return; }
    setCaptureDraft(file);
    persistPhoto(file);
  };
  return <div className="inventory-photo-slot">
    {contextHolder}
    <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" aria-label={'拍摄' + label} onChange={capturePhoto} />
    <div className={`inventory-photo-preview ${photo ? 'is-added' : ''}`}>
      {photo ? <InventoryPhotoImage photo={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImagePlus size={22} />}
    </div>
    <div className="inventory-photo-label">{label}</div>
    {photo ? <Button type="text" danger size="small" icon={<Trash2 size={14} />} disabled={saving} onClick={() => onChange(null)}>删除</Button>
      : <Button type="text" size="small" icon={<Camera size={14} />} loading={saving} disabled={saving} onClick={() => inputRef.current?.click()}>拍照</Button>}
    {captureDraft && !saving && <Button onClick={() => persistPhoto(captureDraft)}>重试保存照片</Button>}
  </div>;
}
