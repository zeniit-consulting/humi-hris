import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:311
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
export const sendPayslip = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslip.url(args, options),
    method: 'post',
})

sendPayslip.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:311
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslip.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            payrollRun: args[0],
            payrollItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payrollRun: typeof args.payrollRun === 'object'
        ? args.payrollRun.id
        : args.payrollRun,
        payrollItem: typeof args.payrollItem === 'object'
        ? args.payrollItem.id
        : args.payrollItem,
    }

    return sendPayslip.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:311
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslip.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:311
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
const sendPayslipForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:311
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslipForm.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

sendPayslip.form = sendPayslipForm

const items = {
    sendPayslip: Object.assign(sendPayslip, sendPayslip),
}

export default items