import auth from './auth'
import company from './company'
import employees from './employees'
import attendances from './attendances'
import leaves from './leaves'
import overtimes from './overtimes'
import recruitment from './recruitment'

const v1 = {
    auth: Object.assign(auth, auth),
    company: Object.assign(company, company),
    employees: Object.assign(employees, employees),
    attendances: Object.assign(attendances, attendances),
    leaves: Object.assign(leaves, leaves),
    overtimes: Object.assign(overtimes, overtimes),
    recruitment: Object.assign(recruitment, recruitment),
}

export default v1