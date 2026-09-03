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

function applyApplicantLandline(applicant) {
  if (!applicant?.id) return;
  const landline = LANDLINE_BY_EMPLOYEE_ID[applicant.id];
  if (landline) applicant.phone = landline;
}

applyApplicantLandline(CURRENT_BORROWER);
applyApplicantLandline(CONSUMABLE_APPLICANT);
applyApplicantLandline(CURRENT_REPLACEMENT_APPLICANT);

DEFAULT_CONTRACT_RETURN_APPLICATIONS.forEach((record) => {
  applyApplicantLandline(record.applicant);
});

DEFAULT_CONTRACT_NUMBER_ALLOCATION_APPLICATIONS.forEach((record) => {
  applyApplicantLandline(record.applicant);
});
