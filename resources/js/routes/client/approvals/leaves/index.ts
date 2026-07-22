import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:162
* @route '/client/approvals/leaves/{leave}/approve'
*/
export const approve = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/client/approvals/leaves/{leave}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:162
* @route '/client/approvals/leaves/{leave}/approve'
*/
approve.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return approve.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:162
* @route '/client/approvals/leaves/{leave}/approve'
*/
approve.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:162
* @route '/client/approvals/leaves/{leave}/approve'
*/
const approveForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:162
* @route '/client/approvals/leaves/{leave}/approve'
*/
approveForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:176
* @route '/client/approvals/leaves/{leave}/reject'
*/
export const reject = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/client/approvals/leaves/{leave}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:176
* @route '/client/approvals/leaves/{leave}/reject'
*/
reject.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return reject.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:176
* @route '/client/approvals/leaves/{leave}/reject'
*/
reject.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:176
* @route '/client/approvals/leaves/{leave}/reject'
*/
const rejectForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:176
* @route '/client/approvals/leaves/{leave}/reject'
*/
rejectForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const leaves = {
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default leaves