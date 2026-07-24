import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/reprimands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::index
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:18
* @route '/hris/reprimands'
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
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
export const tracking = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tracking.url(args, options),
    method: 'get',
})

tracking.definition = {
    methods: ["get","head"],
    url: '/hris/reprimands/tracking/{employee}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
tracking.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return tracking.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
tracking.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tracking.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
tracking.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tracking.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
const trackingForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tracking.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
trackingForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tracking.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::tracking
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:105
* @route '/hris/reprimands/tracking/{employee}'
*/
trackingForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: tracking.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

tracking.form = trackingForm

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::store
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:66
* @route '/hris/reprimands'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/reprimands',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::store
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:66
* @route '/hris/reprimands'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::store
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:66
* @route '/hris/reprimands'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::store
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:66
* @route '/hris/reprimands'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::store
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:66
* @route '/hris/reprimands'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::update
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:82
* @route '/hris/reprimands/{reprimand}'
*/
export const update = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/reprimands/{reprimand}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::update
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:82
* @route '/hris/reprimands/{reprimand}'
*/
update.url = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reprimand: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reprimand: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reprimand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reprimand: typeof args.reprimand === 'object'
        ? args.reprimand.id
        : args.reprimand,
    }

    return update.definition.url
            .replace('{reprimand}', parsedArgs.reprimand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::update
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:82
* @route '/hris/reprimands/{reprimand}'
*/
update.put = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::update
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:82
* @route '/hris/reprimands/{reprimand}'
*/
const updateForm = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::update
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:82
* @route '/hris/reprimands/{reprimand}'
*/
updateForm.put = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::destroy
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:93
* @route '/hris/reprimands/{reprimand}'
*/
export const destroy = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/reprimands/{reprimand}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::destroy
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:93
* @route '/hris/reprimands/{reprimand}'
*/
destroy.url = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reprimand: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reprimand: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reprimand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reprimand: typeof args.reprimand === 'object'
        ? args.reprimand.id
        : args.reprimand,
    }

    return destroy.definition.url
            .replace('{reprimand}', parsedArgs.reprimand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::destroy
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:93
* @route '/hris/reprimands/{reprimand}'
*/
destroy.delete = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::destroy
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:93
* @route '/hris/reprimands/{reprimand}'
*/
const destroyForm = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeReprimandController::destroy
* @see app/Http/Controllers/Hris/EmployeeReprimandController.php:93
* @route '/hris/reprimands/{reprimand}'
*/
destroyForm.delete = (args: { reprimand: number | { id: number } } | [reprimand: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const reprimands = {
    index: Object.assign(index, index),
    tracking: Object.assign(tracking, tracking),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default reprimands