import React, { useState } from 'react';
import { 
  FileText, User, Monitor, Clock, 
  CheckCircle2, XCircle, CornerUpLeft, UserPlus,
  MessageSquare, ShieldCheck
} from 'lucide-react';

// --- 模拟数据 ---
const MOCK_DATA = {
  formId: 'CA-2026071500001',
  applyDate: '2026-07-15',
  status: 'pending', // pending, approved, rejected
  applicant: {
    name: '王英',
    id: '200620',
    phone: '010-00000001',
    email: 'yingwang200620@sohu-lab.com',
    department: '集团总部-员工服务中心-资产部'
  },
  materials: [
    {
      id: 1,
      name: '笔记本-标准笔记本',
      desc: '联想 ThinkPad T14',
      config: 'i7 / 16G / 512G',
      detail: '旧电脑性能不足以支撑新项目编译',
      reason: '设备更新',
      usage: '专业用途',
      isOverStandard: true,
      quantity: 1
    }
  ],
  approvalHistory: [
    { node: '开始', person: '200620-王英', agent: '-', status: 'submitted', time: '2026-07-15 10:20', comment: '-' },
    { node: '部门经理-审批', person: '206984-何文', agent: '-', status: 'agreed', time: '2026-07-16 09:15', comment: '同意，项目确实需要。' },
    { node: '部门总监-审批', person: '111585-刘宇', agent: '-', status: 'agreed', time: '2026-07-16 14:30', comment: '同意' },
    { node: '资产管理员-审批', person: '当前用户', agent: '-', status: 'pending', time: '-', comment: '-' },
  ]
};

export default function ApprovalPagePrototype() {
  const [comment, setComment] = useState('同意');

  // 状态标签渲染小组件
  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'submitted':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">已提交</span>;
      case 'agreed':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">已同意</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">待审批</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
    }
  };

  const renderApplicantInfo = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="text-[15px] font-semibold text-slate-800">申请人信息</h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">申请人</span>
            <span className="text-sm text-slate-800 font-medium">{MOCK_DATA.applicant.id}-{MOCK_DATA.applicant.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">申请日期</span>
            <span className="text-sm text-slate-800 font-medium">{MOCK_DATA.applyDate}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">电话</span>
            <span className="text-sm text-slate-800 font-medium">{MOCK_DATA.applicant.phone}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-500">邮箱</span>
            <span className="text-sm text-slate-800 font-medium">{MOCK_DATA.applicant.email}</span>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-2">
            <span className="text-xs text-slate-500">部门</span>
            <span className="text-sm text-slate-800 font-medium">{MOCK_DATA.applicant.department}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaterialInfo = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Monitor className="w-5 h-5 text-blue-600" />
        <h2 className="text-[15px] font-semibold text-slate-800">申请物资信息</h2>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-5 font-medium">物资说明</th>
              <th className="py-3 px-4 font-medium">配置</th>
              <th className="py-3 px-4 font-medium w-48">详细说明</th>
              <th className="py-3 px-4 font-medium">申请原因</th>
              <th className="py-3 px-4 font-medium">申请用途</th>
              <th className="py-3 px-4 font-medium text-center">是否超标</th>
              <th className="py-3 px-5 font-medium text-center w-20">数量</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_DATA.materials.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{item.desc}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.config || '无'}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{item.detail}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.reason}</td>
                <td className="py-3 px-4 text-sm text-slate-700">{item.usage}</td>
                <td className="py-3 px-4 text-center">
                  {item.isOverStandard ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">是</span>
                  ) : (
                    <span className="text-sm text-slate-500">否</span>
                  )}
                </td>
                <td className="py-3 px-5 text-center font-semibold text-slate-800">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApprovalHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Clock className="w-5 h-5 text-blue-600" />
        <h2 className="text-[15px] font-semibold text-slate-800">审批信息</h2>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="py-3 px-5 font-medium w-40">审批环节</th>
              <th className="py-3 px-4 font-medium">申请人/审批人</th>
              <th className="py-3 px-4 font-medium text-center">代理人</th>
              <th className="py-3 px-4 font-medium text-center w-28">审批状态</th>
              <th className="py-3 px-4 font-medium w-40">审批时间</th>
              <th className="py-3 px-5 font-medium">审批意见</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_DATA.approvalHistory.map((history, idx) => (
              <tr key={idx} className={`${history.status === 'pending' ? 'bg-amber-50/20' : 'hover:bg-slate-50/50'} transition-colors`}>
                <td className="py-3 px-5 text-sm font-medium text-slate-700">{history.node}</td>
                <td className="py-3 px-4 text-sm text-slate-800">{history.person}</td>
                <td className="py-3 px-4 text-sm text-slate-500 text-center">{history.agent}</td>
                <td className="py-3 px-4 text-center">
                  <StatusBadge status={history.status} />
                </td>
                <td className="py-3 px-4 text-sm text-slate-500 font-mono text-[13px]">{history.time}</td>
                <td className="py-3 px-5 text-sm text-slate-600">{history.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActionArea = () => (
    <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden sticky bottom-6 z-10 ring-1 ring-black/5">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-blue-50/50">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h2 className="text-[14px] font-semibold text-slate-800">当前审批操作</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <div className="flex gap-4">
          <MessageSquare className="w-5 h-5 text-slate-400 mt-2 shrink-0" />
          <textarea
            className="flex-1 w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner"
            rows="3"
            placeholder="请填写审批意见（可选）..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex items-center justify-end gap-3 pt-2">
          <button className="px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
            <CornerUpLeft className="w-4 h-4" />
            返回
          </button>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
            <UserPlus className="w-4 h-4" />
            加签
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="px-6 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-4 h-4" />
            驳回
          </button>
          <button className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg transform active:scale-95">
            <CheckCircle2 className="w-4 h-4" />
            同意
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 font-sans p-6 pb-24 overflow-y-auto">
      <div className="max-w-[1000px] mx-auto">
        
        {/* 页头区 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-600 p-1 bg-blue-100 rounded-lg" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">统一申请单</h1>
            <StatusBadge status="pending" />
          </div>
          <div className="mt-2 md:mt-0 text-sm text-slate-500 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md shadow-sm border border-slate-200">
            <span>单号:</span>
            <span className="font-mono font-medium text-slate-700">{MOCK_DATA.formId}</span>
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="space-y-6 relative">
          {renderApplicantInfo()}
          {renderMaterialInfo()}
          {renderApprovalHistory()}
          
          {/* 吸底操作区 */}
          {renderActionArea()}
        </div>

      </div>
    </div>
  );
}