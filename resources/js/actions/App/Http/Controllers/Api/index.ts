import PakasirWebhookController from './PakasirWebhookController'
import TelegramWebhookController from './TelegramWebhookController'
import ThirdParty from './ThirdParty'
import Mobile from './Mobile'
import PortalPushDeviceController from './PortalPushDeviceController'
import PortalReimbursementController from './PortalReimbursementController'
import PortalResourceController from './PortalResourceController'
import PortalApprovalController from './PortalApprovalController'
import PortalPerformanceController from './PortalPerformanceController'
import PortalClientVisitController from './PortalClientVisitController'

const Api = {
    PakasirWebhookController: Object.assign(PakasirWebhookController, PakasirWebhookController),
    TelegramWebhookController: Object.assign(TelegramWebhookController, TelegramWebhookController),
    ThirdParty: Object.assign(ThirdParty, ThirdParty),
    Mobile: Object.assign(Mobile, Mobile),
    PortalPushDeviceController: Object.assign(PortalPushDeviceController, PortalPushDeviceController),
    PortalReimbursementController: Object.assign(PortalReimbursementController, PortalReimbursementController),
    PortalResourceController: Object.assign(PortalResourceController, PortalResourceController),
    PortalApprovalController: Object.assign(PortalApprovalController, PortalApprovalController),
    PortalPerformanceController: Object.assign(PortalPerformanceController, PortalPerformanceController),
    PortalClientVisitController: Object.assign(PortalClientVisitController, PortalClientVisitController),
}

export default Api