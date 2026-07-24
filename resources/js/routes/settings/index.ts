import payroll from './payroll'
import users from './users'
import whatsapp from './whatsapp'

const settings = {
    payroll: Object.assign(payroll, payroll),
    users: Object.assign(users, users),
    whatsapp: Object.assign(whatsapp, whatsapp),
}

export default settings