import EmailActivationController from './EmailActivationController'
import PortalOtpLoginController from './PortalOtpLoginController'

const Auth = {
    EmailActivationController: Object.assign(EmailActivationController, EmailActivationController),
    PortalOtpLoginController: Object.assign(PortalOtpLoginController, PortalOtpLoginController),
}

export default Auth