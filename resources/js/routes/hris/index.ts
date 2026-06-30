import employees from './employees'
import subCompanies from './sub-companies'
import clientBillings from './client-billings'
import manpowerRequests from './manpower-requests'
import organizationChart from './organization-chart'
import performances from './performances'
import recruitment from './recruitment'
import divisions from './divisions'
import positions from './positions'
import attendances from './attendances'
import clientVisits from './client-visits'
import schedules from './schedules'
import shiftChangeRequests from './shift-change-requests'
import attendanceApprovals from './attendance-approvals'
import payrolls from './payrolls'
import kasbons from './kasbons'
import assets from './assets'
import leaves from './leaves'
import leaveApprovals from './leave-approvals'
import overtimes from './overtimes'
import overtimeApprovals from './overtime-approvals'
import reports from './reports'
import notifications from './notifications'
import surveys from './surveys'

const hris = {
    employees: Object.assign(employees, employees),
    subCompanies: Object.assign(subCompanies, subCompanies),
    clientBillings: Object.assign(clientBillings, clientBillings),
    manpowerRequests: Object.assign(manpowerRequests, manpowerRequests),
    organizationChart: Object.assign(organizationChart, organizationChart),
    performances: Object.assign(performances, performances),
    recruitment: Object.assign(recruitment, recruitment),
    divisions: Object.assign(divisions, divisions),
    positions: Object.assign(positions, positions),
    attendances: Object.assign(attendances, attendances),
    clientVisits: Object.assign(clientVisits, clientVisits),
    schedules: Object.assign(schedules, schedules),
    shiftChangeRequests: Object.assign(shiftChangeRequests, shiftChangeRequests),
    attendanceApprovals: Object.assign(attendanceApprovals, attendanceApprovals),
    payrolls: Object.assign(payrolls, payrolls),
    kasbons: Object.assign(kasbons, kasbons),
    assets: Object.assign(assets, assets),
    leaves: Object.assign(leaves, leaves),
    leaveApprovals: Object.assign(leaveApprovals, leaveApprovals),
    overtimes: Object.assign(overtimes, overtimes),
    overtimeApprovals: Object.assign(overtimeApprovals, overtimeApprovals),
    reports: Object.assign(reports, reports),
    notifications: Object.assign(notifications, notifications),
    surveys: Object.assign(surveys, surveys),
}

export default hris