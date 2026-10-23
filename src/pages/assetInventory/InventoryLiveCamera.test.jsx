import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import InventoryLiveCamera from './InventoryLiveCamera';
import InventoryMobilePhotoSlot from './InventoryMobilePhotoSlot';
import { saveCapturedInventoryPhoto } from './inventoryMobilePhotoStore';

const mockWarning = jest.fn();
jest.mock('antd', () => ({
  Button: ({ children, onClick, disabled, loading }) => <button disabled={disabled || loading} onClick={onClick}>{children}</button>,
  Modal: ({ children, footer, onCancel }) => <div><button aria-label="关闭相机" onClick={onCancel}>关闭</button>{children}{footer}</div>,
  Alert: ({ title, action }) => <div role="alert">{title}{action}</div>,
  message: { useMessage: () => [{ warning: mockWarning }, null] },
}));
jest.mock('./InventoryPhotoImage', () => () => <div>已保存照片</div>);
jest.mock('./inventoryMobilePhotoStore', () => ({ saveCapturedInventoryPhoto: jest.fn() }));

let stream;
let stop;
let getUserMedia;
let blobCallback;

beforeEach(() => {
  jest.clearAllMocks();
  stop = jest.fn();
  const track = { readyState: 'live', stop };
  stream = { getTracks: () => [track], getVideoTracks: () => [track] };
  getUserMedia = jest.fn().mockResolvedValue(stream);
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
  jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: jest.fn() });
  jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => { blobCallback = callback; callback(new Blob(['live-image'], { type: 'image/jpeg' })); });
});
afterEach(() => jest.restoreAllMocks());

async function readyCamera() {
  await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
  const video = screen.getByLabelText('标签照片实时相机画面');
  Object.defineProperties(video, { videoWidth: { configurable: true, value: 1920 }, videoHeight: { configurable: true, value: 1080 } });
  fireEvent.playing(video);
  return video;
}

test('拍照只取实时相机帧，输出实际文件并释放相机，不提供文件选择', async () => {
  const onCapture = jest.fn();
  const { unmount } = render(<InventoryLiveCamera label="标签照片" onCapture={onCapture} onCancel={jest.fn()} />);
  await readyCamera();
  expect(screen.queryByLabelText('拍摄标签照片', { selector: 'input' })).toBeNull();
  expect(getUserMedia).toHaveBeenCalledWith({ audio: false, video: { facingMode: { ideal: 'environment' } } });
  fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
  await waitFor(() => expect(onCapture).toHaveBeenCalledTimes(1));
  expect(onCapture.mock.calls[0][0]).toBeInstanceOf(File);
  expect(onCapture.mock.calls[0][0].size).toBeGreaterThan(0);
  expect(HTMLCanvasElement.prototype.getContext.mock.results[0].value.drawImage).toHaveBeenCalledWith(screen.getByLabelText('标签照片实时相机画面'), 0, 0);
  unmount();
  expect(stop).toHaveBeenCalledTimes(1);
});

test('拒绝相机权限显示原因，不能回填照片', async () => {
  getUserMedia.mockRejectedValue(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  const onCapture = jest.fn();
  render(<InventoryLiveCamera label="标签照片" onCapture={onCapture} onCancel={jest.fn()} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('未获得相机权限');
  expect(screen.getByRole('button', { name: '拍摄照片' })).toBeDisabled();
  expect(onCapture).not.toHaveBeenCalled();
});

test('关闭后权限请求才返回仍释放相机，不播放迟到的流', async () => {
  let finishPermission;
  getUserMedia.mockReturnValue(new Promise((resolve) => { finishPermission = resolve; }));
  const { unmount } = render(<InventoryLiveCamera label="标签照片" onCapture={jest.fn()} onCancel={jest.fn()} />);
  unmount();
  await act(async () => finishPermission(stream));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
});

test('相机画面无尺寸或已中断不能生成照片', async () => {
  const onCapture = jest.fn();
  render(<InventoryLiveCamera label="标签照片" onCapture={onCapture} onCancel={jest.fn()} />);
  const video = await readyCamera();
  Object.defineProperty(video, 'videoWidth', { configurable: true, value: 0 });
  fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
  expect(screen.getByRole('alert')).toHaveTextContent('相机画面尚未就绪或已中断');
  expect(onCapture).not.toHaveBeenCalled();
});

test('图像编码失败不能回填照片，允许重新打开相机', async () => {
  HTMLCanvasElement.prototype.toBlob.mockImplementation((callback) => callback(null));
  const onCapture = jest.fn();
  render(<InventoryLiveCamera label="标签照片" onCapture={onCapture} onCancel={jest.fn()} />);
  await readyCamera();
  fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('拍照失败');
  fireEvent.click(screen.getByRole('button', { name: '重新打开相机' }));
  await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(2));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(onCapture).not.toHaveBeenCalled();
});

test('图像编码期间离开页面不会回填迟到的照片', async () => {
  HTMLCanvasElement.prototype.toBlob.mockImplementation((callback) => { blobCallback = callback; });
  const onCapture = jest.fn();
  const { unmount } = render(<InventoryLiveCamera label="标签照片" onCapture={onCapture} onCancel={jest.fn()} />);
  await readyCamera();
  fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
  unmount();
  await act(async () => blobCallback(new Blob(['image'], { type: 'image/jpeg' })));
  expect(onCapture).not.toHaveBeenCalled();
  expect(stop).toHaveBeenCalledTimes(1);
});

test('照片保存失败不计已拍摄，保留实际帧重试后才回填', async () => {
  saveCapturedInventoryPhoto.mockRejectedValueOnce(new Error('照片保存失败')).mockResolvedValueOnce({ photoId: 7, label: '标签照片' });
  const onChange = jest.fn();
  render(<InventoryMobilePhotoSlot label="标签照片" onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: '拍照' }));
  await readyCamera();
  fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
  await waitFor(() => expect(mockWarning).toHaveBeenCalledWith('照片保存失败'));
  expect(onChange).not.toHaveBeenCalled();
  expect(stop).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: '重试保存照片' }));
  await waitFor(() => expect(onChange).toHaveBeenCalledWith({ photoId: 7, label: '标签照片' }));
  expect(saveCapturedInventoryPhoto.mock.calls[0][0]).toBe(saveCapturedInventoryPhoto.mock.calls[1][0]);
});

test('取消拍照不保存、不回填，释放相机', async () => {
  const onChange = jest.fn();
  render(<InventoryMobilePhotoSlot label="标签照片" onChange={onChange} />);
  fireEvent.click(screen.getByRole('button', { name: '拍照' }));
  await readyCamera();
  fireEvent.click(screen.getByRole('button', { name: '取消' }));
  expect(stop).toHaveBeenCalledTimes(1);
  expect(saveCapturedInventoryPhoto).not.toHaveBeenCalled();
  expect(onChange).not.toHaveBeenCalled();
});
