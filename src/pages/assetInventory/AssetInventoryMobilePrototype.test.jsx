import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AssetInventoryMobilePrototype from './AssetInventoryMobilePrototype';
import { getInventoryLocationChanges } from './inventoryLocationChangeStore';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';
import { savePhotoReviewResult } from './inventoryPhotoReviewStore';

let mockLocationState = {};
const mockWarning = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ state: mockLocationState, key: 'mobile-test' }),
}), { virtual: true });

jest.mock('antd', () => {
  const React = require('react');
  const Button = ({ children, icon, onClick, disabled, type: _type, shape: _shape, danger: _danger, block: _block, size: _size, ...props }) => (
    <button type="button" disabled={disabled} onClick={onClick} {...props}>{icon}{children}</button>
  );
  const Input = ({ value, onChange, bordered: _bordered, ...props }) => <input value={value || ''} onChange={onChange} {...props} />;
  Input.TextArea = ({ value, onChange, showCount: _showCount, ...props }) => <textarea value={value || ''} onChange={onChange} {...props} />;
  const Modal = ({ open, title, children }) => open ? <div role="dialog"><h2>{title}</h2>{children}</div> : null;
  const Tag = ({ children }) => <span>{children}</span>;
  const message = { useMessage: () => [{ warning: mockWarning, info: jest.fn(), success: jest.fn() }, null] };
  return { Button, Input, Modal, Tag, message };
});

describe('AssetInventoryMobilePrototype', () => {
  beforeEach(() => { window.sessionStorage.clear(); window.localStorage.clear(); mockLocationState = {}; mockWarning.mockClear(); });

  const scanMine = () => {
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描本人资产' }));
  };

  test('各状态分组可折叠，已盘页签隐藏开始盘点', () => {
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

  test('直接详情无上传区域，扫码详情上传必传照片后提交返回扫码', () => {
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
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('assetInventoryPhotoReview:demo'))[0].status).toBe('审核中');
    scanMine();
    expect(screen.getByText('资产已完成盘点')).toBeInTheDocument();
  });

  test('列表普通扫码进入单资产详情，提交后继续扫码下一资产', () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '开始盘点' }));
    expect(screen.queryByRole('button', { name: '模拟扫描标签' })).not.toBeInTheDocument();
    scanMine();
    expect(screen.getByText('资产标签号')).toBeInTheDocument();
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    scanMine();
    expect(screen.getByText('114130000019')).toBeInTheDocument();
    expect(screen.queryByText('上传图片')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
  });

  test('监督计划包含报失分组，去除提交，盘点仍为普通扫描', () => {
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

  test('快扫仅在机房及符合角色时展示，范围外标签不进入待提交列表', () => {
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

  test('机房快扫补拍照片后返回标签列表并批量提交', () => {
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
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
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

  test('ES资产组在员工盘点也能使用快扫', () => {
    mockLocationState = { scopeRanges: ['员工'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    expect(screen.getByText(/本次共扫描到资产 1 个/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    expect(screen.getByText('114121801802')).toBeInTheDocument();
  });

  test('机房责任人可使用独立快扫入口', () => {
    mockLocationState = { scopeRanges: ['机房'], mobileUser: { name: '机房管理员', employeeNo: 'SERVER-ADMIN', isESAssetGroup: false } };
    render(<AssetInventoryMobilePrototype />);
    expect(screen.getByRole('button', { name: '快速扫描' })).toBeInTheDocument();
  });

  test('报失资产可继续盘点，图片审核驳回和重新进入后仍不能二次报失', () => {
    const { unmount } = render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /惠普.P221显示器/ }));
    expect(screen.getByRole('button', { name: '盘点' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '报失' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    expect(screen.queryByText('扫码后系统会根据盘点任务自动校验资产范围和盘点状态')).not.toBeInTheDocument();
    scanMine();
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(screen.getByText('扫码盘点')).toBeInTheDocument();
    window.sessionStorage.clear();
    expect(JSON.parse(window.localStorage.getItem('assetInventoryPhotoReview:demo')).find((row) => row.assetTag === '1141100548').status).toBe('审核中');
    savePhotoReviewResult('', { assetTag: '1141100548', status: '未盘' });
    unmount();
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: /惠普.P221显示器/ }));
    expect(screen.getByRole('button', { name: '盘点' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '报失' })).not.toBeInTheDocument();
  });

  test('复盘仅扫描后可以改地点，提交记录差异但审批前台账保持原位置', () => {
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

  test('复盘不修改地点可直接提交，不生成位置变更明细', () => {
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

  test('复盘快扫地点输入在批量提交前不形成位置变更记录', () => {
    mockLocationState = { projectNo: 'RCP-202608180001', projectType: '复盘', scopeRanges: ['机房'] };
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '快速扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫描标签' }));
    fireEvent.click(screen.getByRole('button', { name: '结束扫描' }));
    fireEvent.click(screen.getByRole('button', { name: '查看资产114140000031' }));
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getInventoryLocationChanges('RCP-202608180001')[0].after.floor).toBe('8层');
    expect(getAssetMaintenanceRows().find((row) => row.tag === '114140000031').floor).toBe('机房');
  });

  test('移动入口可切公共演示计划，扫码修改地点并写入现有公共资产台账', () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '公共地点演示' }));
    expect(screen.getByText('公共资产沿用原项目清单样本，仅供本页扫码演示')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /公共资产演示计划/ }));
    expect(screen.getByText('戴尔.24寸显示器')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描他人资产' }));
    expect(screen.getByRole('combobox', { name: '城市' })).toHaveValue('北京市');
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getAssetMaintenanceRows().find((row) => row.tag === '3102200966').floor).toBe('8层');
  });

  test('移动入口可切复盘演示计划，位置记录按复盘项目隔离', () => {
    render(<AssetInventoryMobilePrototype />);
    fireEvent.click(screen.getByRole('button', { name: '复盘地点演示' }));
    fireEvent.click(screen.getByRole('button', { name: '监督计划' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /复盘地点演示计划/ }));
    fireEvent.click(screen.getByRole('button', { name: '盘点' }));
    fireEvent.click(screen.getByRole('button', { name: '模拟扫码' }));
    fireEvent.click(screen.getByRole('button', { name: '扫描本人资产' }));
    expect(screen.getByRole('combobox', { name: '楼层 / 机房' })).toBeInTheDocument();
    screen.getAllByRole('button', { name: '拍照' }).forEach((button) => fireEvent.click(button));
    fireEvent.change(screen.getByRole('combobox', { name: '楼层 / 机房' }), { target: { value: '8层' } });
    fireEvent.click(screen.getByRole('button', { name: '提交' }));
    expect(getInventoryLocationChanges('RCP-202608180001')).toHaveLength(1);
    expect(getInventoryLocationChanges('CP-202608180002')).toHaveLength(0);
  });
});
