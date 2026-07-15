import PakasirWebhookController from './PakasirWebhookController'
import ThirdParty from './ThirdParty'
import Mobile from './Mobile'
import PortalReimbursementController from './PortalReimbursementController'
import PortalResourceController from './PortalResourceController'
import PortalPerformanceController from './PortalPerformanceController'
import PortalClientVisitController from './PortalClientVisitController'

const Api = {
    PakasirWebhookController: Object.assign(PakasirWebhookController, PakasirWebhookController),
    ThirdParty: Object.assign(ThirdParty, ThirdParty),
    Mobile: Object.assign(Mobile, Mobile),
    PortalReimbursementController: Object.assign(PortalReimbursementController, PortalReimbursementController),
    PortalResourceController: Object.assign(PortalResourceController, PortalResourceController),
    PortalPerformanceController: Object.assign(PortalPerformanceController, PortalPerformanceController),
    PortalClientVisitController: Object.assign(PortalClientVisitController, PortalClientVisitController),
}

export default Api