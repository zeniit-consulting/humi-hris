import approvalSettings from './approval-settings'
import employees from './employees'
import subCompanies from './sub-companies'
import manpowerRequests from './manpower-requests'
import reprimands from './reprimands'
import organizationChart from './organization-chart'
import performances from './performances'
import recruitment from './recruitment'
import divisions from './divisions'
import positions from './positions'
import attendances from './attendances'
import clientVisits from './client-visits'
import attendanceApprovals from './attendance-approvals'
import schedules from './schedules'
import shiftChangeRequests from './shift-change-requests'
import clientBillings from './client-billings'
import payrolls from './payrolls'
import kasbons from './kasbons'
import reimbursements from './reimbursements'
import reports from './reports'
import leaves from './leaves'
import leaveApprovals from './leave-approvals'
import overtimes from './overtimes'
import overtimeApprovals from './overtime-approvals'
import assets from './assets'
import notifications from './notifications'
import surveys from './surveys'

const hris = {
    approvalSettings: Object.assign(approvalSettings, approvalSettings),
    employees: Object.assign(employees, employees),
    subCompanies: Object.assign(subCompanies, subCompanies),
    manpowerRequests: Object.assign(manpowerRequests, manpowerRequests),
    reprimands: Object.assign(reprimands, reprimands),
    organizationChart: Object.assign(organizationChart, organizationChart),
    performances: Object.assign(performances, performances),
    recruitment: Object.assign(recruitment, recruitment),
    divisions: Object.assign(divisions, divisions),
    positions: Object.assign(positions, positions),
    attendances: Object.assign(attendances, attendances),
    clientVisits: Object.assign(clientVisits, clientVisits),
    attendanceApprovals: Object.assign(attendanceApprovals, attendanceApprovals),
    schedules: Object.assign(schedules, schedules),
    shiftChangeRequests: Object.assign(shiftChangeRequests, shiftChangeRequests),
    clientBillings: Object.assign(clientBillings, clientBillings),
    payrolls: Object.assign(payrolls, payrolls),
    kasbons: Object.assign(kasbons, kasbons),
    reimbursements: Object.assign(reimbursements, reimbursements),
    reports: Object.assign(reports, reports),
    leaves: Object.assign(leaves, leaves),
    leaveApprovals: Object.assign(leaveApprovals, leaveApprovals),
    overtimes: Object.assign(overtimes, overtimes),
    overtimeApprovals: Object.assign(overtimeApprovals, overtimeApprovals),
    assets: Object.assign(assets, assets),
    notifications: Object.assign(notifications, notifications),
    surveys: Object.assign(surveys, surveys),
}

export default hris