import { submitReplayReview } from './inventoryReplayReviewStore';
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import AssetInventoryMobilePrototype from './AssetInventoryMobilePrototype';
import { getInventoryLocationChanges } from './inventoryLocationChangeStore';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { savePhotoReviewResult } from './inventoryPhotoReviewStore';
import { getMobileInventoryResults, saveMobileInventoryResult } from './inventoryMobileResultStore';
import { INVENTORY_MOBILE_ASSETS } from '../../mock/inventoryMobileMock';
import { getPhotoReviewResults } from './inventoryPhotoReviewStore';
import { saveInventoryPhotoSnapshot } from './inventoryPhotoRules';
import { buildReviewRows } from './AssetInventoryImageReviewV2';

import { installInventoryPhotoIndexedDb } from '../../testUtils/inventoryPhotoIndexedDb';

let mockLocationState = {};
const mockWarning = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: mockLocationState, key: 'mobile-test' }),
}), { virtual: true });

jest.mock('antd', () => {
  const React = require('react');
  const Button = ({ children, icon, onClick, disabled, type: _type, shape: _shape, danger: _danger, block: _block, size: _size, loading: _loading, ...props }) => (
    <button type="button" disabled={disabled} onClick={onClick} {...props}>{icon}{children}</button>
  );
  const Input = ({ value, onChange, bordered: _bordered, ...props }) => <input value={value || ''} onChange={onChange} {...props} />;
  Input.TextArea = ({ value, onChange, showCount: _showCount, ...props }) => <textarea value={value || ''} onChange={onChange} {...props} />;
  const Modal = ({ open, title, children, footer }) => open ? <div role="dialog"><h2>{title}</h2>{children}{footer}</div> : null;
  const Tag = ({ children }) => <span>{children}</span>;
  const message = { useMessage: () => [{ warning: mockWarning, info: jest.fn(), success: jest.fn() }, null] };
  return { Button, Input, Modal, Tag, message };

});

describe('AssetInventoryMobilePrototype', () => {
  beforeEach(() => {
    window.sessionStorage.clear(); window.localStorage.clear(); mockLocationState = {}; mockWarning.mockClear(); installInventoryPhotoIndexedDb();
    const track = { readyState: 'live', stop: jest.fn() };
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [track], getVideoTracks: () => [track] }) } });
    jest.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: jest.fn() });
    jest.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['camera-frame'], { type: 'image/jpeg' })));
  });
  afterEach(() => jest.restoreAllMocks());

  const capturePhotos = async () => {
    const buttons = screen.getAllByRole('button', { name: '拍照', exact: true });
    for (let index = 0; index < buttons.length; index += 1) {
      fireEvent.click(buttons[index]);
      await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(index + 1));
      const video = screen.getByLabelText(/实时相机画面$/);
      Object.defineProperties(video, { videoWidth: { configurable: true, value: 1280 }, videoHeight: { configurable: true, value: 720 } });
      fireEvent.playing(video);
      fireEvent.click(screen.getByRole('button', { name: '拍摄照片' }));
      await waitFor(() => expect(screen.getAllByRole('button', { name: '删除' })).toHaveLength(index + 1));
    }
    await act(async () => {});
  };

  const scanMine = () => {
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描本人资产' }));
  };

  test('项目关闭后保留本人任务查询和详情，隐藏全部写入口', () => {
    mockLocationState = { projectNo: 'CLOSED-MOBILE', projectType: '初盘', scopeRanges: ['员工'] };
    sessionStorage.setItem('assetInventoryClosedProjectNos', JSON.stringify(['CLOSED-MOBILE']));
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getByLabelText('搜索资产')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '开始盘点' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '快速扫描' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /戴尔.Latitude E7280/ }));
    expect(screen.getByText('资产标签号')).toBeInTheDocument();
    for (const action of ['盘点', '提交', '报失', '拍照', '删除']) expect(screen.queryByRole('button', { name: action, exact: true })).not.toBeInTheDocument();
  });
  test('已进入审批的资产仍可查看详情，但不能盘点或报失', () => {
    const asset = INVENTORY_MOBILE_ASSETS[0];
    const project = { projectNo: 'LOCKED-MOBILE', projectType: '复盘', status: '盘点中' };
    submitReplayReview({ project, plans: [{ planNo: 'LOCKED-PLAN', status: '盘点中' }], assetsForPlan: () => [{ assetTag: asset.tagNo, quantity: 1, supervisor: '徐博' }], operator: '孙志强' });
    mockLocationState = { projectNo: project.projectNo, projectType: '复盘', scopeRanges: ['员工'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /戴尔.Latitude E7280/ }));
    expect(screen.getByText('资产标签号')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '盘点', exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '报失', exact: true })).not.toBeInTheDocument();
  });

  test.each([false, true])('移动扫码按快照照片标记提交，并同步人工审核：%s', async needPhoto => {
    const asset = INVENTORY_MOBILE_ASSETS[0];
    mockLocationState = { projectNo: 'PHOTO-MOBILE', projectType: '初盘', scopeRanges: ['员工'] };
    saveInventoryPhotoSnapshot({ projectNo: 'PHOTO-MOBILE', photoConfig: { enabled: needPhoto, rules: [] } }, [{
      key: 'photo-asset', assetTag: asset.tagNo, description: asset.assetDesc, serialNo: asset.serialNo,
      inventoryRange: '员工', owner: asset.owner, ownerNo: asset.ownerNo, quantity: 1,
      useStatus: asset.usageStatus, subCategory: asset.category, inventoryStatus: '未盘',
      city: '北京市', building: '搜狐媒体大厦', floor: '9层', executeInventory: true, needPhoto,
    }]);
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    scanMine();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    if (needPhoto) {
      expect(mockWarning).toHaveBeenCalledWith('请先拍摄并上传必需的照片，再提交盘点');
      await capturePhotos();
      fireEvent.click(screen.getByRole('button', { name: '提交' }));
    } else {
      expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
    }
    expect(getMobileInventoryResults('PHOTO-MOBILE')[asset.tagNo].status).toBe(needPhoto ? '审核中' : '已盘');
    expect(buildReviewRows('PHOTO-MOBILE', ['员工'])).toHaveLength(needPhoto ? 1 : 0);
  });

  test('模拟本人和他人资产按责任人身份选择，不交换结果', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    scanMine();
    expect(screen.getAllByText('戴尔.Latitude E7280').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描他人资产' }));
    expect(screen.queryByText('戴尔.Latitude E7280')).not.toBeInTheDocument();
    expect(screen.getAllByText(/机房管理员/).length).toBeGreaterThan(0);
  });

  test('从指定本人资产进入扫码时不能选择相反身份的模拟项', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /戴尔.Latitude E7280/ }));
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    expect(screen.getByRole('button', { name: '扫描本人资产' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: '扫描他人资产' })).toBeDisabled();
  });

  test('扫码异常继续留在扫码，休息退出原扫码入口', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描已盘资产' }));
    fireEvent.click(screen.getByRole('button', { name: '再接再厉' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描范围外资产' }));
    fireEvent.click(screen.getByRole('button', { name: '休息一下' }));
    expect(screen.getByRole('button', { name: '开始盘点' })).toBeInTheDocument();
    expect(screen.queryByText('扫码盘点')).not.toBeInTheDocument();
  });

  test('模拟提交网络失败返回原资产详情且保留照片，不保存结果', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    scanMine();
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟网络失败' }));
    fireEvent.click(screen.getByRole('button', { name: '好的' }));
    expect(screen.getAllByText('戴尔.Latitude E7280').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: '删除' })).toHaveLength(2);
    await screen.findByAltText('资产整体照片');
    await screen.findByAltText('二维码标签照片');
    expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();
    expect(getMobileInventoryResults('')).toEqual({});
  });


  test.each(['公共', '库房', '机房'])('%s需照片普通扫码按范围进入审核或完成', async (area) => {
    const asset = INVENTORY_MOBILE_ASSETS.find(row => row.area === area);
    const original = { status: asset.status, photoRequired: asset.photoRequired };
    asset.status = '未盘';
    asset.photoRequired = true;
    mockLocationState = { scopeRanges: [area] };
    try {
      render(<AssetInventoryMobilePrototype />);
      fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
      fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
      fireEvent.click(screen.getByRole('button', { name: '扫描他人资产' }));
      await capturePhotos();
      fireEvent.click(screen.getByRole('button', { name: '提交' }));
      expect(getMobileInventoryResults('')[asset.tagNo].status).toBe(area === '机房' ? '代盘' : '审核中');
      expect(getMobileInventoryResults('')[asset.tagNo].resultSource).toBe('狐小e');
      expect(getPhotoReviewResults('')).toHaveLength(area === '机房' ? 0 : 1);
      if (area !== '机房') expect(getPhotoReviewResults('')[0].inventoryRange).toBe(area);
    } finally { Object.assign(asset, original); }
  });

  test.each(['公共', '库房', '机房'])('%s需照片快扫按范围进入审核或完成', async (area) => {
    const asset = INVENTORY_MOBILE_ASSETS.find(row => row.area === area);
    const original = { status: asset.status, photoRequired: asset.photoRequired };
    asset.status = '未盘';
    asset.photoRequired = true;
    mockLocationState = { scopeRanges: [area] };
    try {
      render(<AssetInventoryMobilePrototype />);
      fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
      fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
      fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
      fireEvent.click(screen.getByRole('button', { name: (area === '公共' ? '查看资产' : '补拍照片') + asset.tagNo }));
      await capturePhotos();
      fireEvent.click(screen.getByRole('button', { name: area === '公共' ? '保存' : '保存图片' }));
      fireEvent.click(screen.getByRole('button', { name: '提交' }));
      expect(getMobileInventoryResults('')[asset.tagNo].status).toBe(area === '机房' ? '代盘' : '审核中');
      expect(getMobileInventoryResults('')[asset.tagNo].resultSource).toBe('狐小e快速扫描');
      expect(getPhotoReviewResults('')).toHaveLength(area === '机房' ? 0 : 1);
    } finally { Object.assign(asset, original); }
  });

  test('各状态分组可折叠，已盘页签隐藏开始盘点', async () => {
    render(<AssetInventoryMobilePrototype />);
    const lossGroup = screen.getByRole('button', { name: '报失—共1条' });
    fireEvent.click(lossGroup);
    expect(screen.queryByText('惠普.P221显示器')).not.toBeInTheDocument();
    fireEvent.click(lossGroup);
    expect(screen.getByText('惠普.P221显示器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /已盘 0/ }));
    expect(screen.queryByRole('button', { name: '开始盘点' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '审核中—共0条' })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: '审核中—共0条' }));
    expect(screen.getByRole('button', { name: '审核中—共0条' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('直接详情无上传区域，扫码详情上传必传照片后提交返回扫码', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /戴尔.Latitude E7280/ }));
    expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '报失' })).toHaveClass('inventory-mobile-detail-action');
    expect(screen.getByRole('button', { name: '盘点' })).toHaveClass('inventory-mobile-detail-action');
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    scanMine();
    expect(screen.getByText('上传图片')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(mockWarning).toHaveBeenCalledWith('请先拍摄并上传必需的照片，再提交盘点');
    expect(screen.getByText('上传图片')).toBeInTheDocument();
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('assetInventoryPhotoReview:demo'))[0].status).toBe('审核中');
    scanMine();
    expect(screen.getByText('资产已完成盘点')).toBeInTheDocument();
  });

  test('列表普通扫码进入单资产详情，提交后继续扫码下一资产', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    expect(screen.queryByRole('button', { name: '模拟扫描标签' })).not.toBeInTheDocument();
    scanMine();
    expect(screen.getByText('资产标签号')).toBeInTheDocument();
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    scanMine();
    expect(screen.getByText('114130000019')).toBeInTheDocument();
    expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
  });

  test('监督计划包含报失分组，去除提交，盘点仍为普通扫描', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /员工盘点/ }));
    expect(screen.getByRole('button', { name: '报失—共1条' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '提交' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '报失—共1条' }));
    expect(screen.queryByText('惠普.P221显示器')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
  });

  test('快扫仅在机房及符合角色时展示，范围外标签不进入待提交列表', async () => {
    mockLocationState = { scopeRanges: ['机房'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描项目外资产' }));
    expect(mockWarning).toHaveBeenCalledWith('不在当前盘点项目内');
    expect(screen.getByText(/本次共扫描到资产 1 个/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    expect(screen.getByText('本次扫描标签号—共1条')).toBeInTheDocument();
    expect(screen.queryByText('114140000999')).not.toBeInTheDocument();
  });

  test('机房快扫补拍照片后返回标签列表并批量提交', async () => {
    mockLocationState = { scopeRanges: ['机房'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(mockWarning).toHaveBeenCalledWith('请先补拍必需照片，再批量提交');
    expect(screen.getByText('本次扫描标签号—共1条')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '补拍照片114140000031' }));
    expect(screen.getByText('上传图片')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '保存图片' }));
    expect(mockWarning).toHaveBeenCalledWith('请拍摄全部必需照片');
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', { name: '保存图片' }));
    expect(screen.getByText('待提交标签')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText(/其中0条资产信息错误/)).toBeInTheDocument();
  });

  test.each([
    { scopeRanges: ['员工'], mobileUser: { name: '普通员工', employeeNo: 'OTHER', isESAssetGroup: false } },
    { scopeRanges: ['机房'], mobileUser: { name: '财务', employeeNo: 'FINANCE', isESAssetGroup: false } },
  ])('普通身份在非机房范围及无权限身份没有快扫入口', (state) => {
    mockLocationState = state;
    render(<AssetInventoryMobilePrototype />);
    expect(screen.queryByRole('button', { name: '快速扫描' })).not.toBeInTheDocument();
  });

  test('ES资产组在员工盘点也能使用快扫', async () => {
    mockLocationState = { scopeRanges: ['员工'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    expect(screen.getByText(/本次共扫描到资产 1 个/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    expect(screen.getByText('114121801802')).toBeInTheDocument();
  });

  test('机房责任人可使用独立快扫入口', async () => {
    mockLocationState = { scopeRanges: ['机房'], mobileUser: { name: '机房管理员', employeeNo: 'SERVER-ADMIN', isESAssetGroup: false } };
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getByRole('button', { name: '快速扫描' })).toBeInTheDocument();
  });

  test('报失资产可继续盘点，图片审核驳回恢复未盘后允许再次报失', async () => {
    const { unmount } = render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /惠普.P221显示器/ }));
    expect(screen.getByRole('button', { name: '盘点' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '报失' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    expect(screen.queryByText('扫码后系统会根据盘点任务自动校验资产范围和盘点状态')).not.toBeInTheDocument();
    scanMine();
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    window.sessionStorage.clear();
    expect(JSON.parse(window.localStorage.getItem('assetInventoryPhotoReview:demo')).find((row) => row.assetTag === '1141100548').status).toBe('审核中');
    expect(getMobileInventoryResults('')['1141100548']).toMatchObject({ lossReason: '未在工位找到，已联系部门确认', inventoryRemark: '未在工位找到，已联系部门确认' });
    savePhotoReviewResult('', { assetTag: '1141100548', status: '未盘' });
    unmount();
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /惠普.P221显示器/ }));
    expect(screen.getByRole('button', { name: '盘点' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '报失' })).toBeInTheDocument();
  });

  test('复盘仅扫描后可以改地点，提交记录差异但审批前台账保持原位置', async () => {
    mockLocationState = { projectNo: 'RCP-202608180001', projectType: '复盘' };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /苹果.iphone 17/ }));
    expect(screen.queryByRole('combobox', { name: '城市' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    scanMine();
    expect(screen.getByRole('combobox', { name: '城市' })).toHaveValue('北京市');
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getInventoryLocationChanges('RCP-202608180001')[0].after.floor).toBe('8层');
    expect(getAssetMaintenanceRows().find((row) => row.tag === '114130000019').floor).toBe('9层');
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
  });

  test('复盘不修改地点可直接提交，不生成位置变更明细', async () => {
    mockLocationState = { projectNo: 'RCP-202608180001', projectType: '复盘' };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /苹果.iphone 17/ }));
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    scanMine();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(screen.getByText('资产地址')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(screen.getByRole('button', { name: '开始盘点' })).toBeInTheDocument();
  });

  test('复盘快扫地点输入在批量提交前不形成位置变更记录', async () => {
    mockLocationState = { projectNo: 'RCP-202608180001', projectType: '复盘', scopeRanges: ['机房'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '查看资产114140000031' }));
    await capturePhotos();
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getInventoryLocationChanges('RCP-202608180001')[0].after.floor).toBe('8层');
    expect(getAssetMaintenanceRows().find((row) => row.tag === '114140000031').floor).toBe('机房');
  });

  test('移动入口可切公共演示计划，扫码修改地点并写入现有公共资产台账', async () => {
    render(<AssetInventoryMobilePrototype />);
    expect(screen.queryByText('演示计划')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /北京市盘点计划-公共盘点/ }));
    expect(screen.getByText('戴尔.24寸显示器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描他人资产' }));
    expect(screen.getByRole('combobox', { name: '城市' })).toHaveValue('北京市');
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getAssetMaintenanceRows().find((row) => row.tag === '3102200966').floor).toBe('8层');
  });

  test('移动入口可切复盘演示计划，位置记录按复盘项目隔离', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /北京市复盘计划/ }));
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描本人资产' }));
    expect(screen.getByRole('combobox', { name: '楼层 / 机房' })).toBeInTheDocument();
    await capturePhotos();
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(1);
    expect(getInventoryLocationChanges('CP-202608180002')).toHaveLength(0);
  });
  test('公共资产扫码页返回原详情后可继续返回计划，不循环进入扫码', async () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', {name:'监督计划'}));
    fireEvent.click(screen.getByRole('menuitem', {name:/北京市盘点计划-公共盘点/}));
    fireEvent.click(screen.getByRole('button', {name:/戴尔.24寸显示器 未盘/}));
    fireEvent.click(screen.getByRole('button', {name:'盘点'}));
    fireEvent.click(screen.getByRole('button', {name:'模拟扫码'}));
    fireEvent.click(screen.getByRole('button', {name:'扫描他人资产'}));
    fireEvent.click(screen.getByRole('button', {name:'返回'}));
    fireEvent.click(screen.getByRole('button', {name:'返回'}));
    expect(screen.queryByRole('combobox', {name:'城市'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'返回'}));
    expect(screen.getByText('北京市盘点计划-公共盘点')).toBeInTheDocument();
  });

  test.each(['扫描范围外资产', '扫描无效二维码'])('本人已无待盘时%s提示收工并回首页', (label) => {
    mockLocationState = { projectNo: 'FINISHED-SCAN', scopeRanges: ['员工'] };
    INVENTORY_MOBILE_ASSETS.filter(asset => asset.ownerNo === '201132000160').forEach(asset => saveMobileInventoryResult('FINISHED-SCAN', asset.tagNo, {status:'已盘'}));
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', {name:'开始盘点'}));
    fireEvent.click(screen.getByRole('button', {name:'模拟扫码'}));
    fireEvent.click(screen.getByRole('button', {name:label}));
    expect(screen.getByText(/您的全部资产已经完成盘点了/)).toBeInTheDocument();
    expect(screen.queryByRole('button', {name:'再接再厉'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'好的，收工'}));
    expect(screen.getByRole('button', {name:'开始盘点'})).toBeInTheDocument();
  });

  test('监督计划完成后入口数量及计划红点同时消失', () => {
    mockLocationState = {projectNo:'SUPERVISED-COUNT',scopeRanges:['员工']};
    INVENTORY_MOBILE_ASSETS.filter(asset => asset.area === '员工' && asset.id !== 'asset-002').forEach(asset => saveMobileInventoryResult('SUPERVISED-COUNT',asset.tagNo,{status:'已盘'}));
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getByLabelText('未完成监督计划1个')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'开始盘点'}));scanMine();
    fireEvent.click(screen.getByRole('button', {name:'提交'}));
    fireEvent.click(screen.getByRole('button', {name:'返回'}));
    expect(screen.queryByLabelText('未完成监督计划1个')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name:'监督计划'}));
    expect(screen.getByRole('menuitem', {name:/员工盘点/}).querySelector('.inventory-plan-dot')).toBeNull();
  });

  test('实际拍照内容和盘点备注传到审核，刷新后保留且不替成样例', async () => {
    const asset = INVENTORY_MOBILE_ASSETS[0];
    mockLocationState = {projectNo:'CAPTURE-RESULT',scopeRanges:['员工']};
    saveMobileInventoryResult('CAPTURE-RESULT',asset.tagNo,{inventoryRemark:'本次备注'});
    const {unmount}=render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', {name:'开始盘点'}));scanMine();
    expect(screen.getByText('盘点备注')).toBeInTheDocument();
    await capturePhotos();
    fireEvent.click(screen.getByRole('button', {name:'提交'}));
    const result=getMobileInventoryResults('CAPTURE-RESULT')[asset.tagNo];
    expect(result.resultSource).toBe('狐小e');
    expect(result.photos.overall.photoId).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toContain('data:image');
    const row=buildReviewRows('CAPTURE-RESULT',['员工']).find(item=>item.asset.assetTag===asset.tagNo);
    expect(row.asset.counter).toBe('孙志强');expect(row.asset.inventoryNote).toBe('本次备注');
    expect(row.photos.overall.photoId).toBe(result.photos.overall.photoId);
    unmount();render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button',{name:/已盘 0/}));
    const photo=await screen.findByAltText('最近一次资产整体照片');
    expect(photo).toHaveAttribute('src',expect.stringMatching(/^blob:inventory-\d+\.jpg$/));
    expect(photo.closest('button')).toHaveTextContent('盘点日期');
    expect(photo.closest('button')).not.toHaveTextContent('盘点截止日期');
  });

  test('一张数量10的资产在移动未盘分组统计为10，仍只展示一张资产卡片', () => {
    const asset = INVENTORY_MOBILE_ASSETS[0];
    mockLocationState = { projectNo: 'Q10', scopeRanges: ['员工'] };
    saveInventoryPhotoSnapshot({ projectNo: 'Q10', photoConfig: { enabled: false, rules: [] } }, [{
      key: 'q10', assetTag: asset.tagNo, description: asset.assetDesc, quantity: 10,
      inventoryRange: '员工', owner: asset.owner, ownerNo: asset.ownerNo,
      executeInventory: true, inventoryStatus: '未盘',
    }]);
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getByRole('button', { name: '未盘—共10条' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: new RegExp(asset.tagNo) })).toHaveLength(1);
  });

  test('PC快照里的盘点备注和盘点人显示到移动详情',()=>{
    const asset=INVENTORY_MOBILE_ASSETS[0];mockLocationState={projectNo:'PC-REMARK',scopeRanges:['员工']};
    saveInventoryPhotoSnapshot({projectNo:'PC-REMARK',photoConfig:{enabled:false,rules:[]}},[{key:'pc-row',quantity:asset.quantity,assetTag:asset.tagNo,description:asset.assetDesc,inventoryRange:'员工',owner:asset.owner,ownerNo:asset.ownerNo,executeInventory:true,inventoryStatus:'未盘',inventoryRemark:'PC已有备注',counter:'PC盘点人'}]);
    render(<AssetInventoryMobilePrototype/>);
    fireEvent.click(screen.getByRole('button',{name:/戴尔.Latitude E7280/}));
    expect(screen.getByText('盘点备注')).toBeInTheDocument();expect(screen.getByText('PC已有备注')).toBeInTheDocument();expect(screen.getByText('PC盘点人')).toBeInTheDocument();
  });

  test.each([
    { isESAssetGroup: true, area: '员工' },
    { isESAssetGroup: false, area: '员工' },
    { isESAssetGroup: true, area: '公共' },
    { isESAssetGroup: false, area: '公共' },
  ])('详情扩展字段按ES角色展示，与范围无关：$isESAssetGroup / $area', ({ isESAssetGroup, area }) => {
    const asset = INVENTORY_MOBILE_ASSETS.find(row => row.area === area);
    mockLocationState = { projectNo: 'DETAIL-ROLE', scopeRanges: [area], mobileUser: { name: asset.owner, employeeNo: asset.ownerNo, isESAssetGroup } };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(asset.tagNo) }));
    ['用途', '公司', '使用说明', '备注'].forEach(label => {
      if (isESAssetGroup) expect(screen.getByText(label, { exact: true })).toBeInTheDocument();
      else expect(screen.queryByText(label, { exact: true })).not.toBeInTheDocument();
    });
    expect(screen.getByText('资产标签号')).toBeInTheDocument();
  });

  test('监督计划资产清单不展示审核中资产，不计入已盘组', () => {
    const employeeAssets = INVENTORY_MOBILE_ASSETS.filter(asset => asset.area === '员工');
    mockLocationState = { projectNo: 'SUPERVISED-REVIEW', scopeRanges: ['员工'] };
    employeeAssets.forEach(asset => saveMobileInventoryResult('SUPERVISED-REVIEW', asset.tagNo, { status: '审核中' }));
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /员工盘点/ }));
    expect(screen.getByRole('button', { name: '已盘—共0条' })).toBeInTheDocument();
    employeeAssets.forEach(asset => expect(screen.queryByRole('button', { name: new RegExp(asset.tagNo) })).not.toBeInTheDocument());
    expect(screen.queryByText('审核中')).not.toBeInTheDocument();
  });

  test('移动未盘卡片必盘优先、已盘保留必盘标签，刷新继续读取快照标记', () => {
    mockLocationState = { projectNo: 'MANDATORY-MOBILE', projectType: '复盘', scopeRanges: ['员工'], mandatoryAssetKeys: ['M0', 'M1'] };
    const snapshotAssets = INVENTORY_MOBILE_ASSETS.slice(0, 3).map((asset, index) => ({
      key: `M${index}`, assetTag: asset.tagNo, description: asset.assetDesc, serialNo: asset.serialNo,
      quantity: 1, owner: asset.owner, ownerNo: asset.ownerNo, inventoryRange: '员工',
      useStatus: asset.usageStatus, subCategory: asset.category, executeInventory: true,
      inventoryStatus: index === 2 ? '已盘' : '未盘',
      ...(index === 0 ? { isMandatory: false } : index === 2 ? { isMandatory: true } : {}),
    }));
    saveInventoryPhotoSnapshot({ projectNo: 'MANDATORY-MOBILE', photoConfig: { enabled: false, rules: [] } }, snapshotAssets);
    const { unmount } = render(<AssetInventoryMobilePrototype />);
    const uncountedCards = screen.getAllByRole('button', { name: /114121801802|114130000019/ });
    expect(uncountedCards[0]).toHaveTextContent('114130000019');
    expect(uncountedCards[0]).toHaveTextContent('必盘');
    expect(uncountedCards[1]).not.toHaveTextContent('必盘');
    fireEvent.click(screen.getByRole('button', { name: /^已盘 1$/ }));
    expect(screen.getByRole('button', { name: /1141100548/ })).toHaveTextContent('必盘');
    unmount();
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getAllByRole('button', { name: /114121801802|114130000019/ })[0]).toHaveTextContent('114130000019');
  });
});
