import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import InventoryLocationChangeFlow from './InventoryLocationChangeFlow';
import { createInventoryLocationChangeDemo, getInventoryLocationChanges, getInventoryLocationChangeRequests } from './inventoryLocationChangeStore';
import { getAssetMaintenanceRows } from '../../services/assetManagementService';

const mockError=jest.fn();
jest.mock('antd',()=>{
 const React=require('react');
 const Input=({value,onChange,suffix:_suffix,...props})=><input value={value || ''} onChange={onChange} {...props}/>;
 Input.TextArea=({value,onChange,showCount:_showCount,...props})=><textarea value={value || ''} onChange={onChange} {...props}/>;
 return {Card:({children,title,extra})=><section>{title}{extra}{children}</section>,Modal:({open,children})=>open?<div>{children}</div>:null,Upload:({children})=><div>{children}</div>,Input, Button:({children,onClick,disabled})=><button disabled={disabled} onClick={onClick}>{children}</button>,Space:({children})=><div>{children}</div>,Typography:{Text:({children})=><span>{children}</span>,Title:({children})=><h1>{children}</h1>},message:{useMessage:()=>[{error:mockError,success:jest.fn(),warning:jest.fn()},null]},Table:({columns,dataSource})=><table><thead><tr>{columns.map((c,i)=><th key={i}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map((row,i)=><tr key={i}>{columns.map((c,j)=><td key={j}>{c.render?c.render(row[c.dataIndex],row):row[c.dataIndex]}</td>)}</tr>)}</tbody></table>};
});
jest.mock('../../components/StatusTag',()=>({value})=><span>{value}</span>);
jest.mock('../../components/DetailGrid',()=>({__esModule:true,default:({children})=><div>{children}</div>,DetailItem:({label,children})=><div><span>{label}</span><span>{children}</span></div>}));
jest.mock('../../components/SelectModal',()=>({open,onSelect,onConfirm,onCancel,dataSource,multiple})=>open?<div role="dialog">{dataSource.map(row=><button key={row.id || row.tag} onClick={()=>{multiple ? onConfirm([row]) : onSelect(row);onCancel();}}>{row.name || row.tag}</button>)}</div>:null);
const project={projectNo:'RCP-202608180001',projectType:'复盘'};
beforeEach(()=>{window.localStorage.clear();mockError.mockClear();createInventoryLocationChangeDemo(project);});

test('编辑页按截图显示八列、申请人固定点击人，无原值diff，提交后进入审批页',()=>{
 const view=render(<InventoryLocationChangeFlow project={project} currentOperator="冯丽婷" onBack={()=>{}}/>);
 expect(screen.getByText('冯丽婷')).toBeInTheDocument();
 expect(screen.queryByText('演示操作人')).not.toBeInTheDocument();
 expect(screen.queryByText('主备关系')).not.toBeInTheDocument();
 expect(screen.getAllByRole('columnheader')).toHaveLength(8);
 expect(view.container.querySelector('.inventory-location-diff')).toBeNull();
 expect(screen.getByLabelText('114121801802-楼层/机房')).toHaveValue('8层');
 fireEvent.click(screen.getByRole('button',{name:'提交'}));expect(mockError).toHaveBeenCalledWith('请填写变更原因');
 fireEvent.change(screen.getByLabelText(/变更理由/),{target:{value:'现场核对楼层'}});
 fireEvent.change(screen.getByLabelText('114121801802-备注'),{target:{value:'已上架'}});
 fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(screen.getByRole('heading',{name:'位置变更审批'})).toBeInTheDocument();
 expect(view.container.querySelectorAll('.inventory-location-diff')).toHaveLength(1);
 expect(screen.getByText('审批信息')).toBeInTheDocument();
 const req=getInventoryLocationChangeRequests(project.projectNo)[0];expect(req.applicant).toBe('冯丽婷');
 expect(getInventoryLocationChanges(project.projectNo)[0].remark).toBe('已上架');
 view.unmount();render(<InventoryLocationChangeFlow project={project} currentOperator="213852-孙志强" initialRequestId={req.id} onBack={()=>{}}/>);
 expect(screen.getByText('已上架')).toBeInTheDocument();expect(screen.getAllByText('冯丽婷')).toHaveLength(2);
 expect(screen.queryByRole('button',{name:'同意'})).not.toBeInTheDocument();
});

test('何文通过独立审批入口操作，审批后更新台账，返回回调可用',()=>{
 render(<InventoryLocationChangeFlow project={project} currentOperator="213852-孙志强" onBack={()=>{}}/>);
 fireEvent.change(screen.getByLabelText(/变更理由/),{target:{value:'现场位置核对'}});fireEvent.click(screen.getByRole('button',{name:'提交'}));
 const req=getInventoryLocationChangeRequests(project.projectNo)[0];
 const onBack=jest.fn();const view=render(<InventoryLocationChangeFlow project={project} currentOperator="206984-何文" initialRequestId={req.id} onBack={onBack}/>);
 expect(screen.getByRole('button',{name:'同意'})).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'同意'}));
 expect(getAssetMaintenanceRows().find(row=>row.tag==='114121801802').floor).toBe('8层');
 fireEvent.click(view.getAllByRole('button',{name:'返回'})[1]);expect(onBack).toHaveBeenCalled();
});


test('从项目内候选添加资产，编辑地点后同待发起明细整批提交',()=>{
 render(<InventoryLocationChangeFlow project={project} projectAssets={[{assetTag:'114130000019'}]} currentOperator="冯丽婷" onBack={()=>{}}/>);
 fireEvent.click(screen.getByRole('button',{name:'添加资产'}));fireEvent.click(screen.getByRole('button',{name:'114130000019'}));
 fireEvent.click(screen.getByLabelText('114130000019-楼层/机房'));fireEvent.click(screen.getByRole('button',{name:'8层'}));
 fireEvent.change(screen.getByLabelText(/变更理由/),{target:{value:'补充现场核对资产'}});fireEvent.click(screen.getByRole('button',{name:'提交'}));
 expect(getInventoryLocationChanges(project.projectNo)).toHaveLength(2);expect(getInventoryLocationChangeRequests(project.projectNo)[0].changeIds).toHaveLength(2);expect(screen.getByRole('heading',{name:'位置变更审批'})).toBeInTheDocument();
});


test('项目关闭后从历史申请重开只读，无同意驳回及提交按钮',()=>{
 const view=render(<InventoryLocationChangeFlow project={project} currentOperator="冯丽婷" onBack={()=>{}}/>);
 fireEvent.change(screen.getByLabelText(/变更理由/),{target:{value:'闭项前发起'}});fireEvent.click(screen.getByRole('button',{name:'提交'}));
 const req=getInventoryLocationChangeRequests(project.projectNo)[0];view.unmount();
 render(<InventoryLocationChangeFlow project={{...project,status:'盘点关闭'}} currentOperator="206984-何文" initialRequestId={req.id} onBack={()=>{}}/>);
 expect(screen.queryByRole('button',{name:'同意'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'驳回'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'提交'})).not.toBeInTheDocument();expect(screen.queryByLabelText('审批意见')).not.toBeInTheDocument();expect(getInventoryLocationChangeRequests(project.projectNo)[0].status).toBe('待审批');
});
