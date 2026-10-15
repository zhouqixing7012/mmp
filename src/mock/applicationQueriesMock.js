import { legacyApplicationRows } from './applicationLegacyMock';
import { claimApplicationRows } from './applicationClaimMock';
import { applicationUnfinishedRows } from './applicationUnfinishedMock';

// 申请菜单独立交易演示入口；不把现状查询误接到报表预生成结果表。
export const applicationQueryRows = [...legacyApplicationRows, ...claimApplicationRows, ...applicationUnfinishedRows];
