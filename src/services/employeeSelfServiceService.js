import {
  DEFAULT_EMPLOYEE_SELF_SERVICE_APPLICATIONS,
  EMPLOYEE_SELF_SERVICE_STORAGE_KEY,
} from '../mock/employeeSelfServiceMock';
import { readDemoData, writeDemoData } from './demoStorage';

export function getEmployeeSelfServiceApplications() {
  return readDemoData(
    EMPLOYEE_SELF_SERVICE_STORAGE_KEY,
    DEFAULT_EMPLOYEE_SELF_SERVICE_APPLICATIONS
  );
}

export function saveEmployeeSelfServiceApplications(applications) {
  return writeDemoData(EMPLOYEE_SELF_SERVICE_STORAGE_KEY, applications);
}

export function addEmployeeSelfServiceApplication(application) {
  const nextApplications = [application, ...getEmployeeSelfServiceApplications()];
  saveEmployeeSelfServiceApplications(nextApplications);
  return nextApplications;
}

export function updateEmployeeSelfServiceApplication(applicationId, updater) {
  const nextApplications = getEmployeeSelfServiceApplications().map((application) => {
    if (application.id !== applicationId) return application;
    return typeof updater === 'function'
      ? updater(application)
      : { ...application, ...updater };
  });
  saveEmployeeSelfServiceApplications(nextApplications);
  return nextApplications;
}
