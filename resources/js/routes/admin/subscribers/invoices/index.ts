import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approve
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
export const approve = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/admin/subscribers/invoices/{invoice}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approve
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approve.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approve.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approve
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approve.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approve
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
const approveForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approve
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approveForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancel
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
export const cancel = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/admin/subscribers/invoices/{invoice}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancel
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancel.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return cancel.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancel
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancel.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancel
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
const cancelForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancel
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancelForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancel.url(args, options),
    method: 'post',
})

cancel.form = cancelForm

const invoices = {
    approve: Object.assign(approve, approve),
    cancel: Object.assign(cancel, cancel),
}

export default invoices