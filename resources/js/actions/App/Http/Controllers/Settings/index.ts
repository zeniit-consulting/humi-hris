import ProfileController from './ProfileController'
import CompanySettingController from './CompanySettingController'
import AttendanceSettingController from './AttendanceSettingController'
import PayrollSettingController from './PayrollSettingController'
import SubUserController from './SubUserController'
import WhatsappTestController from './WhatsappTestController'
import PasswordController from './PasswordController'
import TwoFactorAuthenticationController from './TwoFactorAuthenticationController'

const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
    CompanySettingController: Object.assign(CompanySettingController, CompanySettingController),
    AttendanceSettingController: Object.assign(AttendanceSettingController, AttendanceSettingController),
    PayrollSettingController: Object.assign(PayrollSettingController, PayrollSettingController),
    SubUserController: Object.assign(SubUserController, SubUserController),
    WhatsappTestController: Object.assign(WhatsappTestController, WhatsappTestController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    TwoFactorAuthenticationController: Object.assign(TwoFactorAuthenticationController, TwoFactorAuthenticationController),
}

export default Settings