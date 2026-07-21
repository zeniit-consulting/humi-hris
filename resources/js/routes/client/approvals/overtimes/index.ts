import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:179
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
export const approve = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/client/approvals/overtimes/{overtime}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:179
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approve.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return approve.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:179
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approve.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:179
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
const approveForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:179
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approveForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:192
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
export const reject = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/client/approvals/overtimes/{overtime}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:192
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
reject.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return reject.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:192
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
reject.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:192
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
const rejectForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:192
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
rejectForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const overtimes = {
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default overtimes