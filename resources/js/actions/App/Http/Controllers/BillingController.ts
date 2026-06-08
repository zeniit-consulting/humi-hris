import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/billing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::index
* @see app/Http/Controllers/BillingController.php:26
* @route '/billing'
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
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
export const invoiceFallback = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invoiceFallback.url(options),
    method: 'get',
})

invoiceFallback.definition = {
    methods: ["get","head"],
    url: '/billing/invoices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
invoiceFallback.url = (options?: RouteQueryOptions) => {
    return invoiceFallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
invoiceFallback.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: invoiceFallback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
invoiceFallback.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: invoiceFallback.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
const invoiceFallbackForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoiceFallback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
invoiceFallbackForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoiceFallback.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::invoiceFallback
* @see app/Http/Controllers/BillingController.php:208
* @route '/billing/invoices'
*/
invoiceFallbackForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: invoiceFallback.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

invoiceFallback.form = invoiceFallbackForm

/**
* @see \App\Http\Controllers\BillingController::createInvoice
* @see app/Http/Controllers/BillingController.php:82
* @route '/billing/invoices'
*/
export const createInvoice = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createInvoice.url(options),
    method: 'post',
})

createInvoice.definition = {
    methods: ["post"],
    url: '/billing/invoices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::createInvoice
* @see app/Http/Controllers/BillingController.php:82
* @route '/billing/invoices'
*/
createInvoice.url = (options?: RouteQueryOptions) => {
    return createInvoice.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::createInvoice
* @see app/Http/Controllers/BillingController.php:82
* @route '/billing/invoices'
*/
createInvoice.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createInvoice.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::createInvoice
* @see app/Http/Controllers/BillingController.php:82
* @route '/billing/invoices'
*/
const createInvoiceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createInvoice.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::createInvoice
* @see app/Http/Controllers/BillingController.php:82
* @route '/billing/invoices'
*/
createInvoiceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createInvoice.url(options),
    method: 'post',
})

createInvoice.form = createInvoiceForm

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
export const payment = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payment.url(args, options),
    method: 'get',
})

payment.definition = {
    methods: ["get","head"],
    url: '/billing/invoices/{invoice}/payment',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
payment.url = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { invoice: args }
    }

    if (Array.isArray(args)) {
        args = {
            invoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        invoice: args.invoice,
    }

    return payment.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
payment.get = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
payment.head = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payment.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
const paymentForm = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
paymentForm.get = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payment.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BillingController::payment
* @see app/Http/Controllers/BillingController.php:249
* @route '/billing/invoices/{invoice}/payment'
*/
paymentForm.head = (args: { invoice: string | number } | [invoice: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payment.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

payment.form = paymentForm

/**
* @see \App\Http\Controllers\BillingController::checkPayment
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
export const checkPayment = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkPayment.url(args, options),
    method: 'post',
})

checkPayment.definition = {
    methods: ["post"],
    url: '/billing/invoices/{invoice}/payment/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::checkPayment
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
checkPayment.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return checkPayment.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::checkPayment
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
checkPayment.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkPayment.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::checkPayment
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
const checkPaymentForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkPayment.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::checkPayment
* @see app/Http/Controllers/BillingController.php:273
* @route '/billing/invoices/{invoice}/payment/check'
*/
checkPaymentForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkPayment.url(args, options),
    method: 'post',
})

checkPayment.form = checkPaymentForm

/**
* @see \App\Http\Controllers\BillingController::uploadProof
* @see app/Http/Controllers/BillingController.php:218
* @route '/billing/invoices/{invoice}/proof'
*/
export const uploadProof = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadProof.url(args, options),
    method: 'post',
})

uploadProof.definition = {
    methods: ["post"],
    url: '/billing/invoices/{invoice}/proof',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BillingController::uploadProof
* @see app/Http/Controllers/BillingController.php:218
* @route '/billing/invoices/{invoice}/proof'
*/
uploadProof.url = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return uploadProof.definition.url
            .replace('{invoice}', parsedArgs.invoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BillingController::uploadProof
* @see app/Http/Controllers/BillingController.php:218
* @route '/billing/invoices/{invoice}/proof'
*/
uploadProof.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadProof.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::uploadProof
* @see app/Http/Controllers/BillingController.php:218
* @route '/billing/invoices/{invoice}/proof'
*/
const uploadProofForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadProof.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::uploadProof
* @see app/Http/Controllers/BillingController.php:218
* @route '/billing/invoices/{invoice}/proof'
*/
uploadProofForm.post = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: uploadProof.url(args, options),
    method: 'post',
})

uploadProof.form = uploadProofForm

/**
* @see \App\Http\Controllers\BillingController::cancelInvoice
* @see app/Http/Controllers/BillingController.php:328
* @route '/billing/invoices/{invoice}'
*/
export const cancelInvoice = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: cancelInvoice.url(args, options),
    method: 'delete',
})

cancelInvoice.definition = {
    methods: ["delete"],
    url: '/billing/invoices/{invoice}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BillingController::cancelInvoice
* @see app/Http/Controllers/BillingController.php:328
* @route '/billing/invoices/{invoice}'
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
* @see \App\Http\Controllers\BillingController::cancelInvoice
* @see app/Http/Controllers/BillingController.php:328
* @route '/billing/invoices/{invoice}'
*/
cancelInvoice.delete = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: cancelInvoice.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\BillingController::cancelInvoice
* @see app/Http/Controllers/BillingController.php:328
* @route '/billing/invoices/{invoice}'
*/
const cancelInvoiceForm = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelInvoice.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BillingController::cancelInvoice
* @see app/Http/Controllers/BillingController.php:328
* @route '/billing/invoices/{invoice}'
*/
cancelInvoiceForm.delete = (args: { invoice: number | { id: number } } | [invoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cancelInvoice.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

cancelInvoice.form = cancelInvoiceForm

const BillingController = { index, invoiceFallback, createInvoice, payment, checkPayment, uploadProof, cancelInvoice }

export default BillingController