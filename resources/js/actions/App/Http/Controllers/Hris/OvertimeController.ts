import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::index
* @see app/Http/Controllers/Hris/OvertimeController.php:25
* @route '/hris/overtimes'
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
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/hris/overtimes/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::exportMethod
* @see app/Http/Controllers/Hris/OvertimeController.php:265
* @route '/hris/overtimes/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
export const approvals = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})

approvals.definition = {
    methods: ["get","head"],
    url: '/hris/overtime-approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
approvals.url = (options?: RouteQueryOptions) => {
    return approvals.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
approvals.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvals.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
approvals.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvals.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
const approvalsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: approvals.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
approvalsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: approvals.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approvals
* @see app/Http/Controllers/Hris/OvertimeController.php:87
* @route '/hris/overtime-approvals'
*/
approvalsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: approvals.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

approvals.form = approvalsForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:160
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
* @see app/Http/Controllers/Hris/OvertimeController.php:160
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
* @see app/Http/Controllers/Hris/OvertimeController.php:160
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
approve.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:160
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
const approveForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::approve
* @see app/Http/Controllers/Hris/OvertimeController.php:160
* @route '/hris/overtime-approvals/{overtime}/approve'
*/
approveForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:179
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
* @see app/Http/Controllers/Hris/OvertimeController.php:179
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
* @see app/Http/Controllers/Hris/OvertimeController.php:179
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
reject.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:179
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
const rejectForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::reject
* @see app/Http/Controllers/Hris/OvertimeController.php:179
* @route '/hris/overtime-approvals/{overtime}/reject'
*/
rejectForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::store
* @see app/Http/Controllers/Hris/OvertimeController.php:198
* @route '/hris/overtimes'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/overtimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::store
* @see app/Http/Controllers/Hris/OvertimeController.php:198
* @route '/hris/overtimes'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::store
* @see app/Http/Controllers/Hris/OvertimeController.php:198
* @route '/hris/overtimes'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::store
* @see app/Http/Controllers/Hris/OvertimeController.php:198
* @route '/hris/overtimes'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::store
* @see app/Http/Controllers/Hris/OvertimeController.php:198
* @route '/hris/overtimes'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::update
* @see app/Http/Controllers/Hris/OvertimeController.php:226
* @route '/hris/overtimes/{overtime}'
*/
export const update = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/overtimes/{overtime}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::update
* @see app/Http/Controllers/Hris/OvertimeController.php:226
* @route '/hris/overtimes/{overtime}'
*/
update.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::update
* @see app/Http/Controllers/Hris/OvertimeController.php:226
* @route '/hris/overtimes/{overtime}'
*/
update.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::update
* @see app/Http/Controllers/Hris/OvertimeController.php:226
* @route '/hris/overtimes/{overtime}'
*/
const updateForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::update
* @see app/Http/Controllers/Hris/OvertimeController.php:226
* @route '/hris/overtimes/{overtime}'
*/
updateForm.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Hris\OvertimeController::destroy
* @see app/Http/Controllers/Hris/OvertimeController.php:255
* @route '/hris/overtimes/{overtime}'
*/
export const destroy = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/overtimes/{overtime}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\OvertimeController::destroy
* @see app/Http/Controllers/Hris/OvertimeController.php:255
* @route '/hris/overtimes/{overtime}'
*/
destroy.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OvertimeController::destroy
* @see app/Http/Controllers/Hris/OvertimeController.php:255
* @route '/hris/overtimes/{overtime}'
*/
destroy.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::destroy
* @see app/Http/Controllers/Hris/OvertimeController.php:255
* @route '/hris/overtimes/{overtime}'
*/
const destroyForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OvertimeController::destroy
* @see app/Http/Controllers/Hris/OvertimeController.php:255
* @route '/hris/overtimes/{overtime}'
*/
destroyForm.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const OvertimeController = { index, exportMethod, approvals, approve, reject, store, update, destroy, export: exportMethod }

export default OvertimeController