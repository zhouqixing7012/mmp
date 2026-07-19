import React, { useState } from 'react';
import { 
  FileText, User, Monitor, Clock, 
  CheckCircle2, XCircle, CornerUpLeft, UserPlus,
  MessageSquare, ShieldCheck, Zap, Server
} from 'lucide-react';

// --- 模拟数据 (基于新截图) ---
const MOCK_DATA = {
  formId: 'CA-2026071600001',
  applyDate: '2026-07-16',
  status: 'pending',
  applicant: {
    name: '王英',
    id: '200620',
    company: '新媒体',
    phone: '010-00000001',
    office: '北京-搜狐媒体大厦',
    email: 'yingwang200620@sohu-lab.com',
    department: '集团总部.员工服务中心.资产部'
  },
  material: {
    name: '缺省.标配笔记本',
    price: '0.00',
    config: '无',
    reason: '1',
    isOverStandard: true,
    detail: '1',
    quantity: 1,
    mainAssetDesc: '-'
  },
  approvalHistory: [
    { node: '开始', person: '200620-王英', agent: '-', status: 'submitted', time: '2026-07-15 10:20', comment: '-' },
    { node: '部门经理-审批', person: '206984-何文', agent: '-', status: 'agreed', time: '2026-07-16 09:15', comment: '-' },
    { node: '部门总监-审批', person: '111585-刘宇', agent: '-', status: 'agreed', time: '2026-07-16 14:30', comment: '同意' },
    { node: '部门总监-审批', person: '110139-张雪梅', agent: '-', status: 'agreed', time: '2026-07-16 15:00', comment: '-' },
  ]
};

export default function AssetAdminApprovalPrototype() {
  const [comment, setComment] = useState('同意');
  const [matchStatus, setMatchStatus] = useState('inventory'); // inventory | purchase
  const [esSuggestion, setEsSuggestion] = useState('');

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

  // 信息键值对小组件
  const InfoItem = ({ label, value, span = 1, isHighlight = false }) => {
    let spanClass = '';
    if (span === 2) spanClass = 'md:col-span-2 lg:col-span-2';
    if (span === 3) spanClass = 'md:col-span-3 lg:col-span-3';
    if (span === 4) spanClass = 'md:col-span-4 lg:col-span-4';

    return (
      <div className={`flex flex-col gap-1.5 ${spanClass}`}>
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className={`text-sm ${isHighlight ? 'text-red-600 font-semibold' : 'text-slate-800'}`}>
          {value}
        </span>
      </div>
    );
  };

  const renderApplicantInfo = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-[15px] font-semibold text-slate-800">申请人信息</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
          <InfoItem label="申请人" value={`${MOCK_DATA.applicant.id}-${MOCK_DATA.applicant.name}`} />
          <InfoItem label="联系电话" value={MOCK_DATA.applicant.phone} />
          <InfoItem label="邮箱" value={MOCK_DATA.applicant.email} />
          
          <InfoItem label="公司" value={MOCK_DATA.applicant.company} />
          <InfoItem label="办公区" value={MOCK_DATA.applicant.office} />
          <InfoItem label="申请日期" value={MOCK_DATA.applyDate} />
          
          <InfoItem label="部门" value={MOCK_DATA.applicant.department} span={3} />
        </div>
      </div>
    </div>
  );

  const renderMaterialDetails = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-indigo-600" />
          <h2 className="text-[15px] font-semibold text-slate-800">申请物资明细</h2>
        </div>
        <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          资产管理员工作区
        </span>
      </div>
      
      <div className="p-0 flex flex-col">
        {/* 上半部分：只读信息区 */}
        <div className="p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 border-b border-slate-200 border-dashed">
          <InfoItem label="物资说明" value={MOCK_DATA.material.name} />
          <InfoItem label="配置" value={MOCK_DATA.material.config} />
          <InfoItem label="参考单价" value={`¥ ${MOCK_DATA.material.price}`} />
          
          <InfoItem label="数量" value={MOCK_DATA.material.quantity} />
          <InfoItem label="申请原因" value={MOCK_DATA.material.reason} />
          <InfoItem label="是否超标" value={MOCK_DATA.material.isOverStandard ? '是' : '否'} isHighlight={MOCK_DATA.material.isOverStandard} />
          
          <InfoItem label="详细说明" value={MOCK_DATA.material.detail} />
          <InfoItem label="主资产说明" value={MOCK_DATA.material.mainAssetDesc} />
        </div>

        {/* 下半部分：管理员操作区 */}
        <div className="p-6 flex flex-col gap-6 bg-white">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 w-24 shrink-0">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">匹配状态</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 flex-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${matchStatus === 'inventory' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                  {matchStatus === 'inventory' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <input 
                  type="radio" 
                  name="matchStatus" 
                  className="hidden" 
                  checked={matchStatus === 'inventory'}
                  onChange={() => setMatchStatus('inventory')}
                />
                <span className={`text-sm ${matchStatus === 'inventory' ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>库存领用</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${matchStatus === 'purchase' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                  {matchStatus === 'purchase' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <input 
                  type="radio" 
                  name="matchStatus" 
                  className="hidden" 
                  checked={matchStatus === 'purchase'}
                  onChange={() => setMatchStatus('purchase')}
                />
                <span className={`text-sm ${matchStatus === 'purchase' ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>统一采购</span>
              </label>

              <div className="w-px h-5 bg-slate-200 mx-2 hidden md:block"></div>
              
              <button className="px-4 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 hover:border-indigo-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
                <Zap className="w-3.5 h-3.5" />
                匹配资产
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
            <div className="flex items-center gap-2 w-24 shrink-0 pt-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">ES建议</span>
            </div>
            <textarea
              className="flex-1 w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
              rows="2"
              placeholder="请输入处理建议或备注信息..."
              value={esSuggestion}
              onChange={(e) => setEsSuggestion(e.target.value)}
            ></textarea>
          </div>

        </div>
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
              <th className="py-3.5 px-5 font-medium w-40">审批环节</th>
              <th className="py-3.5 px-4 font-medium">申请人/审批人</th>
              <th className="py-3.5 px-4 font-medium text-center">代理人</th>
              <th className="py-3.5 px-4 font-medium text-center w-28">审批状态</th>
              <th className="py-3.5 px-4 font-medium w-40">审批时间</th>
              <th className="py-3.5 px-5 font-medium">审批意见</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_DATA.approvalHistory.map((history, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-5 text-sm font-medium text-slate-700">{history.node}</td>
                <td className="py-3.5 px-4 text-sm text-slate-800">{history.person}</td>
                <td className="py-3.5 px-4 text-sm text-slate-400 text-center">{history.agent}</td>
                <td className="py-3.5 px-4 text-center">
                  <StatusBadge status={history.status} />
                </td>
                <td className="py-3.5 px-4 text-sm text-slate-500 font-mono text-[13px]">{history.time}</td>
                <td className="py-3.5 px-5 text-sm text-slate-600">{history.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActionArea = () => (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden sticky bottom-6 z-10 ring-1 ring-black/5">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/80">
        <ShieldCheck className="w-5 h-5 text-blue-600" />
        <h2 className="text-[14px] font-semibold text-slate-800">审批意见</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">
        <textarea
          className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none shadow-inner bg-slate-50/30"
          rows="3"
          placeholder="请填写审批意见（默认同意）..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        
        <div className="flex items-center justify-end gap-3 pt-1">
          <button className="px-5 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
            <CornerUpLeft className="w-4 h-4" />
            返回
          </button>
          <button className="px-5 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
            <UserPlus className="w-4 h-4" />
            加签
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="px-6 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 hover:border-red-300 transition-colors flex items-center gap-1.5 shadow-sm">
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
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-6 pb-24 overflow-y-auto selection:bg-blue-100">
      <div className="max-w-[1000px] mx-auto">
        
        {/* 页头区 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">统一申请单</h1>
              <div className="text-[13px] text-slate-500 mt-0.5">请核对明细并完成审批操作</div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="text-sm text-slate-500 flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg shadow-sm border border-slate-200">
              <span>单号:</span>
              <span className="font-mono font-semibold text-slate-700">{MOCK_DATA.formId}</span>
            </div>
            <StatusBadge status="pending" />
          </div>
        </div>

        {/* 主体内容区 */}
        <div className="space-y-6 relative">
          {renderApplicantInfo()}
          {renderMaterialDetails()}
          {renderApprovalHistory()}
          {renderActionArea()}
        </div>

      </div>
    </div>
  );
}