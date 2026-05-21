export default function AssetComparisonSlide() {
  const rows = [
    // {
    //   id: '1',
    //   module: '资产拆分',
    //   current: '服务器缺乏备件级管理，导致备件数量与资产价值不清晰',
    //   target: '对整机服务器进行资产拆分，拆分后为备件生成独立资产卡片，不影响账务信息',
    //   value: '备件资产可视化，利于成本核算与价值评估',
    // },
    {
      id: '1',
      module: '信息变更',
      current: '依赖责任人或 ES 管理员提交工单，并由 ERP 手动修改信息，流转效率低',
      target: '打通与 NO 及 MIS 系统的接口联动，实现上下游系统信息的自动同步',
      value: '变更及时同步，减少人工干预与错误',
    },
    {
      id: '2',
      module: '验收入库',
      current: '整机采购服务器未作明细拆分，出入库及验收环节依赖线下签字确认',
      target: '对采购服务器进行拆分，生成备件独立资产卡片，出库流程进行线上化审批',
      value: '流程线上化，提升验收与入库规范性',
    },
    {
      id: '3',
      module: '报废处置',
      current: '报废流程依赖线下邮件沟通，且报废资产明细数据需人工逐一核对',
      target: '实现报废流程线上化，系统内直选报废资产，并支持上传凭证归档',
      value: '报废流程高效透明，留痕可追溯，符合内审规定',
    },
    {
      id: '4',
      module: '资产盘点',
      current: '需 NO/MIS 线下导出资产数据，交由 ERP 手动导入资产系统进行核对',
      target: '通过系统接口自动将数据拉取至资产系统，替代人工导入操作，盘点力度细化到备件级（硬盘与内存）',
      value: '盘点自动化，管理颗粒度更精细',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-10 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-[28px] shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-10 pt-8 pb-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex gap-2 items-end">
              <div className="w-10 h-10 rounded-full bg-blue-600" />
              <div className="w-5 h-5 rounded-full bg-orange-400" />
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              机房资产现状与目标对比
            </h1>
          </div>
          <p className="text-xl text-slate-500 ml-14">
            对照目标逐项提升，实现机房资产管理标准化、自动化
          </p>
        </div>

        <div className="px-8 pb-8">
          <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#eef4ff] text-[#2153d4]">
                  <th className="py-5 px-4 text-lg font-bold border-b border-slate-200 w-20">
                    序号
                  </th>
                  <th className="py-5 px-4 text-lg font-bold border-b border-slate-200 w-40">
                    功能模块
                  </th>
                  <th className="py-5 px-6 text-lg font-bold border-b border-slate-200 text-left">
                    现状
                  </th>
                  <th className="py-5 px-6 text-lg font-bold border-b border-slate-200 text-left">
                    目标
                  </th>
                  <th className="py-5 px-6 text-lg font-bold border-b border-slate-200 text-left">
                    目标价值
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="border-b border-slate-200 text-center py-6">
                      <div className="mx-auto w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                        {row.id}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 py-6 px-4">
                      <div className="font-bold text-slate-800 text-xl text-center">
                        {row.module}
                      </div>
                    </td>

                    <td className="border-b border-slate-200 py-6 px-6 text-slate-700 text-base leading-8">
                      {row.current}
                    </td>

                    <td className="border-b border-slate-200 py-6 px-6 text-green-700 text-base leading-8 bg-green-50">
                      {row.target}
                    </td>

                    <td className="border-b border-slate-200 py-6 px-6 text-[#2153d4] font-semibold text-base leading-8 bg-blue-50">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-[24px] border border-orange-200 bg-[#fff9ef] px-8 py-6 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-white text-4xl font-bold">
              ✓
            </div>

            <div>
              <div className="text-3xl font-black text-orange-500 mb-2">
                总结
              </div>
              <div className="text-2xl font-bold text-slate-800 leading-10">
                机房资产管理将实现
                <span className="text-orange-500">流程线上化、数据自动化、管理精细化</span>
                ，全面提升效率与准确性。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
