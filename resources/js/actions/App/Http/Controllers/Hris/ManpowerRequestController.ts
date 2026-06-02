import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/manpower-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::index
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:17
* @route '/hris/manpower-requests'
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
* @see \App\Http\Controllers\Hris\ManpowerRequestController::store
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:67
* @route '/hris/manpower-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/manpower-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::store
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:67
* @route '/hris/manpower-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::store
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:67
* @route '/hris/manpower-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::store
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:67
* @route '/hris/manpower-requests'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::store
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:67
* @route '/hris/manpower-requests'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::update
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:82
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
export const update = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/manpower-requests/{manpowerRequest}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::update
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:82
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
update.url = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { manpowerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { manpowerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            manpowerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        manpowerRequest: typeof args.manpowerRequest === 'object'
        ? args.manpowerRequest.id
        : args.manpowerRequest,
    }

    return update.definition.url
            .replace('{manpowerRequest}', parsedArgs.manpowerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::update
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:82
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
update.put = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::update
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:82
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
const updateForm = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::update
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:82
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
updateForm.put = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\ManpowerRequestController::destroy
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:92
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
export const destroy = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/manpower-requests/{manpowerRequest}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::destroy
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:92
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
destroy.url = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { manpowerRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { manpowerRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            manpowerRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        manpowerRequest: typeof args.manpowerRequest === 'object'
        ? args.manpowerRequest.id
        : args.manpowerRequest,
    }

    return destroy.definition.url
            .replace('{manpowerRequest}', parsedArgs.manpowerRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::destroy
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:92
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
destroy.delete = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::destroy
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:92
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
const destroyForm = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ManpowerRequestController::destroy
* @see app/Http/Controllers/Hris/ManpowerRequestController.php:92
* @route '/hris/manpower-requests/{manpowerRequest}'
*/
destroyForm.delete = (args: { manpowerRequest: number | { id: number } } | [manpowerRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const ManpowerRequestController = { index, store, update, destroy }

export default ManpowerRequestController