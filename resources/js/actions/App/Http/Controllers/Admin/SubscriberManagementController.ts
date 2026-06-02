import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscribers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
export const invoices = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invoices.url(options),
    method: 'get',
})

invoices.definition = {
    methods: ["get","head"],
    url: '/admin/invoices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
invoices.url = (options?: RouteQueryOptions) => {
    return invoices.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
invoices.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
invoices.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: invoices.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
const invoicesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
invoicesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoices.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::invoices
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
invoicesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoices.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

invoices.form = invoicesForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
export const auditLogs = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: auditLogs.url(options),
    method: 'get',
})

auditLogs.definition = {
    methods: ["get","head"],
    url: '/admin/audit-logs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
auditLogs.url = (options?: RouteQueryOptions) => {
    return auditLogs.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
auditLogs.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: auditLogs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
auditLogs.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: auditLogs.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
const auditLogsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: auditLogs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
auditLogsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: auditLogs.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::auditLogs
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:222
* @route '/admin/audit-logs'
*/
auditLogsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: auditLogs.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

auditLogs.form = auditLogsForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::updateSubscription
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
export const updateSubscription = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSubscription.url(args, options),
    method: 'put',
})

updateSubscription.definition = {
    methods: ["put"],
    url: '/admin/subscribers/{subscriber}/subscription',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::updateSubscription
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
updateSubscription.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriber: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscriber: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscriber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscriber: typeof args.subscriber === 'object'
        ? args.subscriber.id
        : args.subscriber,
    }

    return updateSubscription.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::updateSubscription
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
updateSubscription.put = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateSubscription.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::updateSubscription
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
const updateSubscriptionForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSubscription.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::updateSubscription
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
updateSubscriptionForm.put = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateSubscription.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateSubscription.form = updateSubscriptionForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
export const suspend = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

suspend.definition = {
    methods: ["post"],
    url: '/admin/subscribers/{subscriber}/suspend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspend.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriber: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscriber: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscriber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscriber: typeof args.subscriber === 'object'
        ? args.subscriber.id
        : args.subscriber,
    }

    return suspend.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspend.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
const suspendForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suspend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspendForm.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suspend.url(args, options),
    method: 'post',
})

suspend.form = suspendForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
export const reactivate = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

reactivate.definition = {
    methods: ["post"],
    url: '/admin/subscribers/{subscriber}/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivate.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriber: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscriber: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscriber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscriber: typeof args.subscriber === 'object'
        ? args.subscriber.id
        : args.subscriber,
    }

    return reactivate.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivate.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
const reactivateForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivateForm.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reactivate.url(args, options),
    method: 'post',
})

reactivate.form = reactivateForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approveInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
export const approveInvoice = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveInvoice.url(args, options),
    method: 'post',
})

approveInvoice.definition = {
    methods: ["post"],
    url: '/admin/subscribers/invoices/{invoice}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approveInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approveInvoice.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approveInvoice.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approveInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approveInvoice.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveInvoice.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approveInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
const approveInvoiceForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveInvoice.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::approveInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:352
* @route '/admin/subscribers/invoices/{invoice}/approve'
*/
approveInvoiceForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveInvoice.url(args, options),
    method: 'post',
})

approveInvoice.form = approveInvoiceForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancelInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
export const cancelInvoice = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelInvoice.url(args, options),
    method: 'post',
})

cancelInvoice.definition = {
    methods: ["post"],
    url: '/admin/subscribers/invoices/{invoice}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancelInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancelInvoice.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return cancelInvoice.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancelInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancelInvoice.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancelInvoice.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancelInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
const cancelInvoiceForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelInvoice.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::cancelInvoice
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:375
* @route '/admin/subscribers/invoices/{invoice}/cancel'
*/
cancelInvoiceForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelInvoice.url(args, options),
    method: 'post',
})

cancelInvoice.form = cancelInvoiceForm

const SubscriberManagementController = { index, invoices, auditLogs, updateSubscription, suspend, reactivate, approveInvoice, cancelInvoice }

export default SubscriberManagementController