import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BillingController::check
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
export const check = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/billing/invoices/{invoice}/payment/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::check
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
check.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invoice: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { invoice: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            invoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invoice: typeof args.invoice === 'object'
        ? args.invoice.id
        : args.invoice,
    }

    return check.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::check
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
check.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::check
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
const checkForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::check
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
checkForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(args, options),
    method: 'post',
})

check.form = checkForm

const payment = {
    check: Object.assign(check, check),
}

export default payment