import AuthController from './AuthController'
import DashboardController from './DashboardController'
import PortalController from './PortalController'
import AttendanceCorrectionRequestController from './AttendanceCorrectionRequestController'
import ShiftChangeRequestController from './ShiftChangeRequestController'
import MasterController from './MasterController'
import EmployeeController from './EmployeeController'
import AttendanceController from './AttendanceController'
import LeaveController from './LeaveController'
import OvertimeController from './OvertimeController'
import KasbonController from './KasbonController'
import PayrollController from './PayrollController'
import ProfileController from './ProfileController'

const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    PortalController: Object.assign(PortalController, PortalController),
    AttendanceCorrectionRequestController: Object.assign(AttendanceCorrectionRequestController, AttendanceCorrectionRequestController),
    ShiftChangeRequestController: Object.assign(ShiftChangeRequestController, ShiftChangeRequestController),
    MasterController: Object.assign(MasterController, MasterController),
    EmployeeController: Object.assign(EmployeeController, EmployeeController),
    AttendanceController: Object.assign(AttendanceController, AttendanceController),
    LeaveController: Object.assign(LeaveController, LeaveController),
    OvertimeController: Object.assign(OvertimeController, OvertimeController),
    KasbonController: Object.assign(KasbonController, KasbonController),
    PayrollController: Object.assign(PayrollController, PayrollController),
    ProfileController: Object.assign(ProfileController, ProfileController),
}

export default V1