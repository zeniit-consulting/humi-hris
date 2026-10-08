import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/leave-approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:107
* @route '/hris/leave-approvals'
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
* @see \App\Http\Controllers\Hris\LeaveController::bulkApprove
* @see app/Http/Controllers/Hris/LeaveController.php:238
* @route '/hris/leave-approvals/bulk-approve'
*/
export const bulkApprove = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkApprove.url(options),
    method: 'post',
})

bulkApprove.definition = {
    methods: ["post"],
    url: '/hris/leave-approvals/bulk-approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkApprove
* @see app/Http/Controllers/Hris/LeaveController.php:238
* @route '/hris/leave-approvals/bulk-approve'
*/
bulkApprove.url = (options?: RouteQueryOptions) => {
    return bulkApprove.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkApprove
* @see app/Http/Controllers/Hris/LeaveController.php:238
* @route '/hris/leave-approvals/bulk-approve'
*/
bulkApprove.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkApprove.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkApprove
* @see app/Http/Controllers/Hris/LeaveController.php:238
* @route '/hris/leave-approvals/bulk-approve'
*/
const bulkApproveForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkApprove.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkApprove
* @see app/Http/Controllers/Hris/LeaveController.php:238
* @route '/hris/leave-approvals/bulk-approve'
*/
bulkApproveForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkApprove.url(options),
    method: 'post',
})

bulkApprove.form = bulkApproveForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkReject
* @see app/Http/Controllers/Hris/LeaveController.php:267
* @route '/hris/leave-approvals/bulk-reject'
*/
export const bulkReject = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkReject.url(options),
    method: 'post',
})

bulkReject.definition = {
    methods: ["post"],
    url: '/hris/leave-approvals/bulk-reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkReject
* @see app/Http/Controllers/Hris/LeaveController.php:267
* @route '/hris/leave-approvals/bulk-reject'
*/
bulkReject.url = (options?: RouteQueryOptions) => {
    return bulkReject.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkReject
* @see app/Http/Controllers/Hris/LeaveController.php:267
* @route '/hris/leave-approvals/bulk-reject'
*/
bulkReject.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkReject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkReject
* @see app/Http/Controllers/Hris/LeaveController.php:267
* @route '/hris/leave-approvals/bulk-reject'
*/
const bulkRejectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkReject.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::bulkReject
* @see app/Http/Controllers/Hris/LeaveController.php:267
* @route '/hris/leave-approvals/bulk-reject'
*/
bulkRejectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkReject.url(options),
    method: 'post',
})

bulkReject.form = bulkRejectForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::approve
* @see app/Http/Controllers/Hris/LeaveController.php:195
* @route '/hris/leave-approvals/{leave}/approve'
*/
export const approve = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/leave-approvals/{leave}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::approve
* @see app/Http/Controllers/Hris/LeaveController.php:195
* @route '/hris/leave-approvals/{leave}/approve'
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
* @see \App\Http\Controllers\Hris\LeaveController::approve
* @see app/Http/Controllers/Hris/LeaveController.php:195
* @route '/hris/leave-approvals/{leave}/approve'
*/
approve.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::approve
* @see app/Http/Controllers/Hris/LeaveController.php:195
* @route '/hris/leave-approvals/{leave}/approve'
*/
const approveForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::approve
* @see app/Http/Controllers/Hris/LeaveController.php:195
* @route '/hris/leave-approvals/{leave}/approve'
*/
approveForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::reject
* @see app/Http/Controllers/Hris/LeaveController.php:213
* @route '/hris/leave-approvals/{leave}/reject'
*/
export const reject = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/leave-approvals/{leave}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::reject
* @see app/Http/Controllers/Hris/LeaveController.php:213
* @route '/hris/leave-approvals/{leave}/reject'
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
* @see \App\Http\Controllers\Hris\LeaveController::reject
* @see app/Http/Controllers/Hris/LeaveController.php:213
* @route '/hris/leave-approvals/{leave}/reject'
*/
reject.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::reject
* @see app/Http/Controllers/Hris/LeaveController.php:213
* @route '/hris/leave-approvals/{leave}/reject'
*/
const rejectForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::reject
* @see app/Http/Controllers/Hris/LeaveController.php:213
* @route '/hris/leave-approvals/{leave}/reject'
*/
rejectForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const leaveApprovals = {
    index: Object.assign(index, index),
    bulkApprove: Object.assign(bulkApprove, bulkApprove),
    bulkReject: Object.assign(bulkReject, bulkReject),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default leaveApprovals