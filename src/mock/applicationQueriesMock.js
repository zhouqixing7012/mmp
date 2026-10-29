import { legacyApplicationRows } from './applicationLegacyMock';
import { claimApplicationRows } from './applicationClaimMock';
import { applicationUnfinishedRows } from './applicationUnfinishedMock';
import { employeeApplicationRows } from './applicationEmployeeMock';

// 其余申请类型的既有演示来源；移库由applicationQueryService直接投影库存移库源单，不在此另造交易。
export const applicationQueryRows = [...legacyApplicationRows, ...claimApplicationRows, ...applicationUnfinishedRows, ...employeeApplicationRows];
