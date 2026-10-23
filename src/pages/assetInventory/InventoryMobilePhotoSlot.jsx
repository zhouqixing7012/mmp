import React, { useEffect, useRef, useState } from 'react';
import { Button, message as antdMessage } from 'antd';
import InventoryPhotoImage from './InventoryPhotoImage';
import { saveCapturedInventoryPhoto } from './inventoryMobilePhotoStore';
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import InventoryLiveCamera from './InventoryLiveCamera';

// 实时拍摄后保存实际文件内容，不用样例照片或相册文件替代。
export default function InventoryMobilePhotoSlot({ label, photo, onChange }) {
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [captureDraft, setCaptureDraft] = useState(null);
  const [messageApi, contextHolder] = antdMessage.useMessage();
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const persistPhoto = async (file) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const metadata = await saveCapturedInventoryPhoto(file, label);
      if (mountedRef.current) { onChange(metadata); setCaptureDraft(null); }
    } catch (error) { if (mountedRef.current) messageApi.warning(error.message); }
    finally { savingRef.current = false; if (mountedRef.current) setSaving(false); }
  };
  const capturePhoto = (file) => {
    setCameraOpen(false);
    setCaptureDraft(file);
    persistPhoto(file);
  };
  return <div className="inventory-photo-slot">
    {contextHolder}
    {cameraOpen && <InventoryLiveCamera label={label} onCancel={() => setCameraOpen(false)} onCapture={capturePhoto} />}
    <div className={`inventory-photo-preview ${photo ? 'is-added' : ''}`}>
      {photo ? <InventoryPhotoImage photo={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImagePlus size={22} />}
    </div>
    <div className="inventory-photo-label">{label}</div>
    {photo ? <Button type="text" danger size="small" icon={<Trash2 size={14} />} disabled={saving} onClick={() => onChange(null)}>删除</Button>
      : <Button type="text" size="small" icon={<Camera size={14} />} loading={saving} disabled={saving} onClick={() => setCameraOpen(true)}>拍照</Button>}
    {captureDraft && !saving && <Button onClick={() => persistPhoto(captureDraft)}>重试保存照片</Button>}
  </div>;
}
