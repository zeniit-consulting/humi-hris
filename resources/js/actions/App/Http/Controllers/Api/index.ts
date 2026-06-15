import PakasirWebhookController from './PakasirWebhookController'
import ThirdParty from './ThirdParty'
import Mobile from './Mobile'
import PortalResourceController from './PortalResourceController'
import PortalPerformanceController from './PortalPerformanceController'
import PortalClientVisitController from './PortalClientVisitController'

const Api = {
    PakasirWebhookController: Object.assign(PakasirWebhookController, PakasirWebhookController),
    ThirdParty: Object.assign(ThirdParty, ThirdParty),
    Mobile: Object.assign(Mobile, Mobile),
    PortalResourceController: Object.assign(PortalResourceController, PortalResourceController),
    PortalPerformanceController: Object.assign(PortalPerformanceController, PortalPerformanceController),
    PortalClientVisitController: Object.assign(PortalClientVisitController, PortalClientVisitController),
}

export default Api