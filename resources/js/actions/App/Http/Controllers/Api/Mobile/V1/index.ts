import AuthController from './AuthController'
import DashboardController from './DashboardController'
import PortalController from './PortalController'
import MasterController from './MasterController'
import EmployeeController from './EmployeeController'
import AttendanceController from './AttendanceController'
import LeaveController from './LeaveController'
import OvertimeController from './OvertimeController'
import KasbonController from './KasbonController'
import PayrollController from './PayrollController'
import ProfileController from './ProfileController'
import AttendanceCorrectionRequestController from './AttendanceCorrectionRequestController'
import ShiftChangeRequestController from './ShiftChangeRequestController'

const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    PortalController: Object.assign(PortalController, PortalController),
    MasterController: Object.assign(MasterController, MasterController),
    EmployeeController: Object.assign(EmployeeController, EmployeeController),
    AttendanceController: Object.assign(AttendanceController, AttendanceController),
    LeaveController: Object.assign(LeaveController, LeaveController),
    OvertimeController: Object.assign(OvertimeController, OvertimeController),
    KasbonController: Object.assign(KasbonController, KasbonController),
    PayrollController: Object.assign(PayrollController, PayrollController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    AttendanceCorrectionRequestController: Object.assign(AttendanceCorrectionRequestController, AttendanceCorrectionRequestController),
    ShiftChangeRequestController: Object.assign(ShiftChangeRequestController, ShiftChangeRequestController),
}

export default V1