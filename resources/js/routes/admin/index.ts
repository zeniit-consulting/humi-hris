import subscribers from './subscribers'
import invoices from './invoices'
import auditLogs from './audit-logs'

const admin = {
    subscribers: Object.assign(subscribers, subscribers),
    invoices: Object.assign(invoices, invoices),
    auditLogs: Object.assign(auditLogs, auditLogs),
}

export default admin