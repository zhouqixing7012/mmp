// Shared business selectors are selected by field identity, never by the visible role label.
const entities = {
  applicant: 'person', approver: 'person', summaryApplicant: 'person', sender: 'person', receiver: 'person',
  company: 'company', subsidiary: 'subsidiary', sourceSubsidiary: 'subsidiary',
  department: 'department', sourceDepartment: 'department',
  plate: 'plate', warehouse: 'warehouse', office: 'office',
};
export const applicationFilterEntity = field => field.optionSet || entities[field.key];
