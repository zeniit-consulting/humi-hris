import PakasirWebhookController from './PakasirWebhookController'
import Mobile from './Mobile'
import PortalResourceController from './PortalResourceController'

const Api = {
    PakasirWebhookController: Object.assign(PakasirWebhookController, PakasirWebhookController),
    Mobile: Object.assign(Mobile, Mobile),
    PortalResourceController: Object.assign(PortalResourceController, PortalResourceController),
}

export default Api