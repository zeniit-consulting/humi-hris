import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/overtime-approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:86
* @route '/hris/overtime-approvals'
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
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:159
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
export const approve = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/overtime-approvals/{overtime}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:159
* @route '/hris/overtime-approvals/{overtime}/approve'
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
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:159
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
approve.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:159
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
const approveForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:159
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
approveForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:180
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
export const reject = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/overtime-approvals/{overtime}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:180
* @route '/hris/overtime-approvals/{overtime}/reject'
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
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:180
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
reject.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:180
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
const rejectForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:180
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
rejectForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const overtimeApprovals = {
    index: Object.assign(index, index),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default overtimeApprovals