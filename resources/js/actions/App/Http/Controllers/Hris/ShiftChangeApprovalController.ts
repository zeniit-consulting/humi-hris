import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/shift-change-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::index
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:21
* @route '/hris/shift-change-requests'
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
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::approve
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:85
* @route '/hris/shift-change-requests/{shiftChangeRequest}/approve'
*/
export const approve = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/shift-change-requests/{shiftChangeRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::approve
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:85
* @route '/hris/shift-change-requests/{shiftChangeRequest}/approve'
*/
approve.url = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shiftChangeRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { shiftChangeRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            shiftChangeRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shiftChangeRequest: typeof args.shiftChangeRequest === 'object'
        ? args.shiftChangeRequest.id
        : args.shiftChangeRequest,
    }

    return approve.definition.url
            .replace('{shiftChangeRequest}', parsedArgs.shiftChangeRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::approve
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:85
* @route '/hris/shift-change-requests/{shiftChangeRequest}/approve'
*/
approve.post = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::approve
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:85
* @route '/hris/shift-change-requests/{shiftChangeRequest}/approve'
*/
const approveForm = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::approve
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:85
* @route '/hris/shift-change-requests/{shiftChangeRequest}/approve'
*/
approveForm.post = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::reject
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:124
* @route '/hris/shift-change-requests/{shiftChangeRequest}/reject'
*/
export const reject = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/shift-change-requests/{shiftChangeRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::reject
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:124
* @route '/hris/shift-change-requests/{shiftChangeRequest}/reject'
*/
reject.url = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { shiftChangeRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { shiftChangeRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            shiftChangeRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        shiftChangeRequest: typeof args.shiftChangeRequest === 'object'
        ? args.shiftChangeRequest.id
        : args.shiftChangeRequest,
    }

    return reject.definition.url
            .replace('{shiftChangeRequest}', parsedArgs.shiftChangeRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::reject
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:124
* @route '/hris/shift-change-requests/{shiftChangeRequest}/reject'
*/
reject.post = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::reject
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:124
* @route '/hris/shift-change-requests/{shiftChangeRequest}/reject'
*/
const rejectForm = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ShiftChangeApprovalController::reject
* @see app/Http/Controllers/Hris/ShiftChangeApprovalController.php:124
* @route '/hris/shift-change-requests/{shiftChangeRequest}/reject'
*/
rejectForm.post = (args: { shiftChangeRequest: number | { id: number } } | [shiftChangeRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const ShiftChangeApprovalController = { index, approve, reject }

export default ShiftChangeApprovalController