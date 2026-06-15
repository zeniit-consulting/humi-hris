import AuthController from './AuthController'
import CompanyController from './CompanyController'
import EmployeeController from './EmployeeController'
import AttendanceController from './AttendanceController'
import LeaveController from './LeaveController'
import OvertimeController from './OvertimeController'

const V1 = {
    AuthController: Object.assign(AuthController, AuthController),
    CompanyController: Object.assign(CompanyController, CompanyController),
    EmployeeController: Object.assign(EmployeeController, EmployeeController),
    AttendanceController: Object.assign(AttendanceController, AttendanceController),
    LeaveController: Object.assign(LeaveController, LeaveController),
    OvertimeController: Object.assign(OvertimeController, OvertimeController),
}

export default V1