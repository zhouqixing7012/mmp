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
 return {Input, Button:({children,onClick,disabled})=><button disabled={disabled} onClick={onClick}>{children}</button>,Space:({children})=><div>{children}</div>,Typography:{Title:({children})=><h1>{children}</h1>},message:{useMessage:()=>[{error:mockError,success:jest.fn(),warning:jest.fn()},null]},Table:({columns,dataSource})=><table><thead><tr>{columns.map((c,i)=><th key={i}>{c.title}</th>)}</tr></thead><tbody>{dataSource.map((row,i)=><tr key={i}>{columns.map((c,j)=><td key={j}>{c.render?c.render(row[c.dataIndex],row):row[c.dataIndex]}</td>)}</tr>)}</tbody></table>};
});
jest.mock('../../components/SelectModal',()=>({open,onSelect,dataSource})=>open?<div role="dialog">{dataSource.map(row=><button key={row.id} onClick={()=>onSelect(row)}>{row.name}</button>)}</div>:null);
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
