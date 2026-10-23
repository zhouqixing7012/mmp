import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Modal } from 'antd';

const cameraError = (error) => {
  if (['NotAllowedError', 'PermissionDeniedError'].includes(error?.name)) return '未获得相机权限，请允许使用相机后重新拍照';
  if (['NotFoundError', 'DevicesNotFoundError'].includes(error?.name)) return '未找到可用相机，请在有相机的设备上拍照';
  if (['NotReadableError', 'TrackStartError'].includes(error?.name)) return '相机当前不可用，请关闭占用相机的应用后重试';
  return error?.message || '相机启动失败，请重试';
};

// 仅接收实时相机画面，不提供文件或相册选择入口。
export default function InventoryLiveCamera({ label, onCapture, onCancel }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    setReady(false);
    setError('');
    const openCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('当前浏览器无法调用相机，请使用支持相机的安全连接页面');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      } catch (failure) {
        if (!cancelled) {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setError(cameraError(failure));
        }
      }
    };
    openCamera();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [attempt]);

  const capture = async () => {
    const video = videoRef.current;
    if (capturing || !ready) return;
    if (!video?.videoWidth || !video?.videoHeight || !streamRef.current?.getVideoTracks().some((track) => track.readyState === 'live')) {
      setReady(false);
      setError('相机画面尚未就绪或已中断，请重新打开相机');
      return;
    }
    setCapturing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('当前浏览器无法生成照片，请更换支持拍照的浏览器');
      context.drawImage(video, 0, 0);
      const blob = await new Promise((resolve, reject) => canvas.toBlob((image) => image ? resolve(image) : reject(new Error('拍照失败，请重新拍摄')), 'image/jpeg', 0.95));
      if (mountedRef.current) onCapture(new File([blob], `inventory-${Date.now()}.jpg`, { type: blob.type }));
    } catch (failure) {
      if (mountedRef.current) setError(failure.message || '拍照失败，请重新拍摄');
    } finally {
      if (mountedRef.current) setCapturing(false);
    }
  };

  return <Modal open title={`拍摄${label}`} onCancel={onCancel} maskClosable={false} width={520} footer={[
    <Button key="cancel" onClick={onCancel}>取消</Button>,
    <Button key="capture" type="primary" disabled={!ready || !!error} loading={capturing} onClick={capture}>拍摄照片</Button>,
  ]}>
    <video ref={videoRef} autoPlay muted playsInline aria-label={`${label}实时相机画面`} onPlaying={() => setReady(true)} style={{ width: '100%', maxHeight: '55vh', background: '#000', objectFit: 'contain' }} />
    {!ready && !error && <div role="status">正在启动相机…</div>}
    {error && <Alert type="warning" showIcon title={error} action={<Button size="small" onClick={() => setAttempt((value) => value + 1)}>重新打开相机</Button>} />}
  </Modal>;
}
