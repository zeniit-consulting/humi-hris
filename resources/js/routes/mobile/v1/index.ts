import auth from './auth'
import dashboard from './dashboard'
import portal from './portal'
import master from './master'
import employees from './employees'
import attendances from './attendances'
import leaves from './leaves'
import overtimes from './overtimes'
import kasbons from './kasbons'
import payrolls from './payrolls'
import profile from './profile'

const v1 = {
    auth: Object.assign(auth, auth),
    dashboard: Object.assign(dashboard, dashboard),
    portal: Object.assign(portal, portal),
    master: Object.assign(master, master),
    employees: Object.assign(employees, employees),
    attendances: Object.assign(attendances, attendances),
    leaves: Object.assign(leaves, leaves),
    overtimes: Object.assign(overtimes, overtimes),
    kasbons: Object.assign(kasbons, kasbons),
    payrolls: Object.assign(payrolls, payrolls),
    profile: Object.assign(profile, profile),
}

export default v1