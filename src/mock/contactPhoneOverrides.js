import { CURRENT_BORROWER } from './assetBorrowingMock';
import { CONSUMABLE_APPLICANT } from './consumableWorkflowMock';
import { CURRENT_REPLACEMENT_APPLICANT } from './assetReplacementMock';
import { DEFAULT_CONTRACT_RETURN_APPLICATIONS } from './assetReturnMock';
import { DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS } from './contractNumberAllocationMock';

const LANDLINE_BY_EMPLOYEE_ID = {
  '213852': '010-56602852',
  '219319': '010-56601907',
  '220784': '010-56601888',
};

function isLandline(value) {
  return /^0\d{2,3}-\d{7,8}$/.test(String(value || '').trim());
}

function isMobileContact(value) {
  const compact = String(value || '').replace(/\s+/g, '');
  return /^1\d{10}$/.test(compact) || /^1\d{2}\*{4}\d{4}$/.test(compact);
}

function deriveLandline(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const suffix = digits.slice(-4).padStart(4, '0');
  return `010-5660${suffix}`;
}

function isPersonContactRecord(record) {
  return Boolean(
    record
    && typeof record === 'object'
    && !Array.isArray(record)
    && typeof record.phone === 'string'
    && (
      typeof record.name === 'string'
      || typeof record.email === 'string'
      || typeof record.department === 'string'
      || typeof record.applicant === 'string'
    )
  );
}

export function normalizeMockContactPhones(value) {
  if (!value || typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    value.forEach(normalizeMockContactPhones);
    return value;
  }

  if (isPersonContactRecord(value) && isMobileContact(value.phone)) {
    const mappedLandline = LANDLINE_BY_EMPLOYEE_ID[value.id];
    value.phone = mappedLandline
      || (isLandline(value.extension) ? value.extension : deriveLandline(value.phone));
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key !== 'phone' && child && typeof child === 'object') {
      normalizeMockContactPhones(child);
    }
  });

  return value;
}

normalizeMockContactPhones(CURRENT_BORROWER);
normalizeMockContactPhones(CONSUMABLE_APPLICANT);
normalizeMockContactPhones(CURRENT_REPLACEMENT_APPLICANT);
normalizeMockContactPhones(DEFAULT_CONTRACT_RETURN_APPLICATIONS);
normalizeMockContactPhones(DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS);
