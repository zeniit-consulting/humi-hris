import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/attendances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
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
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/attendances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
export const update = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
update.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return update.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
update.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const updateForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
updateForm.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
export const destroy = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroy.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return destroy.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroy.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const destroyForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroyForm.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const attendances = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default attendances