import React, { useMemo, useState } from 'react';
import { Button, Card, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAssetReplacementApplications } from '../../services/assetReplacementService';
import ReplacementHandlingDetail from './ReplacementHandlingDetail';

const HANDLING_NODES = ['旧资产退回', '旧资产确认', '新资产发放', '新资产确认'];

export default function ReplacementHandlingPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const applications = useMemo(() => getAssetReplacementApplications(), [version]);
  const selectedApplication = applications.find((application) => (
    application.status === '处理中' && HANDLING_NODES.includes(application.currentNode)
  )) || null;

  if (!selectedApplication) {
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <Card>
          <Empty description="暂无资产更换办理待办" />
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ReplacementHandlingDetail
      application={selectedApplication}
      onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}
      onUpdated={() => setVersion((value) => value + 1)}
    />
  );
}
