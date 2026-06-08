import PakasirWebhookController from './PakasirWebhookController'
import Mobile from './Mobile'
import PortalResourceController from './PortalResourceController'
import PortalPerformanceController from './PortalPerformanceController'

const Api = {
    PakasirWebhookController: Object.assign(PakasirWebhookController, PakasirWebhookController),
    Mobile: Object.assign(Mobile, Mobile),
    PortalResourceController: Object.assign(PortalResourceController, PortalResourceController),
    PortalPerformanceController: Object.assign(PortalPerformanceController, PortalPerformanceController),
}

export default Api