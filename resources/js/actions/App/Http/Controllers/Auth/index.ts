import WhatsappActivationController from './WhatsappActivationController'
import PortalOtpLoginController from './PortalOtpLoginController'

const Auth = {
    WhatsappActivationController: Object.assign(WhatsappActivationController, WhatsappActivationController),
    PortalOtpLoginController: Object.assign(PortalOtpLoginController, PortalOtpLoginController),
}

export default Auth