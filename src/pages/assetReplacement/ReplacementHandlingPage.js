import React, { useMemo, useState } from 'react';
import { Button, Card, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  getAssetReplacementApplications,
  getAvailableReplacementAssets,
} from '../../services/assetReplacementService';
import ReplacementHandlingDetail from './ReplacementHandlingDetail';

const HANDLING_NODES = ['旧资产退回', '旧资产确认', '新资产发放', '新资产确认'];
const INVENTORY_DEMO_PERSON = '220056-任鑫磊';
const INVENTORY_DEMO_STATUS = '已盘';

function buildInventoryPeriodDemo(application) {
  if (!application) return null;

  const availableAsset = application.newAsset
    || getAvailableReplacementAssets(application.oldAsset, application.issueProcess?.warehouse)[0]
    || null;

  return {
    ...application,
    oldAsset: {
      ...application.oldAsset,
      inventoryPerson: application.oldAsset.inventoryPerson || INVENTORY_DEMO_PERSON,
      inventoryStatus: application.oldAsset.inventoryStatus || INVENTORY_DEMO_STATUS,
    },
    newAsset: availableAsset
      ? {
        ...availableAsset,
        inventoryPerson: availableAsset.inventoryPerson || INVENTORY_DEMO_PERSON,
        inventoryStatus: availableAsset.inventoryStatus || INVENTORY_DEMO_STATUS,
      }
      : null,
  };
}

export default function ReplacementHandlingPage() {
  const navigate = useNavigate();
  const [version, setVersion] = useState(0);
  const applications = useMemo(() => getAssetReplacementApplications(), [version]);
  const selectedApplication = applications.find((application) => (
    application.status === '处理中' && HANDLING_NODES.includes(application.currentNode)
  )) || null;
  const displayApplication = buildInventoryPeriodDemo(selectedApplication);

  if (!displayApplication) {
    return (
      <Card size="small">
        <Empty description="暂无资产更换办理待办" />
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}>返回工作台</Button>
        </div>
      </Card>
    );
  }

  return (
    <ReplacementHandlingDetail
      application={displayApplication}
      onBack={() => navigate('/yewurules', { state: { workspace: '工作台首页' } })}
      onUpdated={() => setVersion((value) => value + 1)}
    />
  );
}
