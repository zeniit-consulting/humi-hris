import Api from './Api'
import DocsManualController from './DocsManualController'
import CareerController from './CareerController'
import Auth from './Auth'
import BillingController from './BillingController'
import DashboardController from './DashboardController'
import Admin from './Admin'
import Client from './Client'
import UserPortalController from './UserPortalController'
import UserPortalSectionController from './UserPortalSectionController'
import Hris from './Hris'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    DocsManualController: Object.assign(DocsManualController, DocsManualController),
    CareerController: Object.assign(CareerController, CareerController),
    Auth: Object.assign(Auth, Auth),
    BillingController: Object.assign(BillingController, BillingController),
    DashboardController: Object.assign(DashboardController, DashboardController),
    Admin: Object.assign(Admin, Admin),
    Client: Object.assign(Client, Client),
    UserPortalController: Object.assign(UserPortalController, UserPortalController),
    UserPortalSectionController: Object.assign(UserPortalSectionController, UserPortalSectionController),
    Hris: Object.assign(Hris, Hris),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers