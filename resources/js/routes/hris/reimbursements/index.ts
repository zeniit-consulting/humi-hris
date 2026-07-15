import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/reimbursements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::index
* @see app/Http/Controllers/Hris/ReimbursementController.php:17
* @route '/hris/reimbursements'
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
* @see \App\Http\Controllers\Hris\ReimbursementController::approve
* @see app/Http/Controllers/Hris/ReimbursementController.php:47
* @route '/hris/reimbursements/{reimbursement}/approve'
*/
export const approve = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/reimbursements/{reimbursement}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::approve
* @see app/Http/Controllers/Hris/ReimbursementController.php:47
* @route '/hris/reimbursements/{reimbursement}/approve'
*/
approve.url = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reimbursement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reimbursement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reimbursement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reimbursement: typeof args.reimbursement === 'object'
        ? args.reimbursement.id
        : args.reimbursement,
    }

    return approve.definition.url
            .replace('{reimbursement}', parsedArgs.reimbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::approve
* @see app/Http/Controllers/Hris/ReimbursementController.php:47
* @route '/hris/reimbursements/{reimbursement}/approve'
*/
approve.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::approve
* @see app/Http/Controllers/Hris/ReimbursementController.php:47
* @route '/hris/reimbursements/{reimbursement}/approve'
*/
const approveForm = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::approve
* @see app/Http/Controllers/Hris/ReimbursementController.php:47
* @route '/hris/reimbursements/{reimbursement}/approve'
*/
approveForm.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::reject
* @see app/Http/Controllers/Hris/ReimbursementController.php:56
* @route '/hris/reimbursements/{reimbursement}/reject'
*/
export const reject = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/reimbursements/{reimbursement}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::reject
* @see app/Http/Controllers/Hris/ReimbursementController.php:56
* @route '/hris/reimbursements/{reimbursement}/reject'
*/
reject.url = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reimbursement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reimbursement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reimbursement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reimbursement: typeof args.reimbursement === 'object'
        ? args.reimbursement.id
        : args.reimbursement,
    }

    return reject.definition.url
            .replace('{reimbursement}', parsedArgs.reimbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::reject
* @see app/Http/Controllers/Hris/ReimbursementController.php:56
* @route '/hris/reimbursements/{reimbursement}/reject'
*/
reject.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::reject
* @see app/Http/Controllers/Hris/ReimbursementController.php:56
* @route '/hris/reimbursements/{reimbursement}/reject'
*/
const rejectForm = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::reject
* @see app/Http/Controllers/Hris/ReimbursementController.php:56
* @route '/hris/reimbursements/{reimbursement}/reject'
*/
rejectForm.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::status
* @see app/Http/Controllers/Hris/ReimbursementController.php:66
* @route '/hris/reimbursements/{reimbursement}/status'
*/
export const status = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/hris/reimbursements/{reimbursement}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::status
* @see app/Http/Controllers/Hris/ReimbursementController.php:66
* @route '/hris/reimbursements/{reimbursement}/status'
*/
status.url = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reimbursement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reimbursement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reimbursement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reimbursement: typeof args.reimbursement === 'object'
        ? args.reimbursement.id
        : args.reimbursement,
    }

    return status.definition.url
            .replace('{reimbursement}', parsedArgs.reimbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::status
* @see app/Http/Controllers/Hris/ReimbursementController.php:66
* @route '/hris/reimbursements/{reimbursement}/status'
*/
status.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::status
* @see app/Http/Controllers/Hris/ReimbursementController.php:66
* @route '/hris/reimbursements/{reimbursement}/status'
*/
const statusForm = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: status.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ReimbursementController::status
* @see app/Http/Controllers/Hris/ReimbursementController.php:66
* @route '/hris/reimbursements/{reimbursement}/status'
*/
statusForm.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: status.url(args, options),
    method: 'post',
})

status.form = statusForm

const reimbursements = {
    index: Object.assign(index, index),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
    status: Object.assign(status, status),
}

export default reimbursements