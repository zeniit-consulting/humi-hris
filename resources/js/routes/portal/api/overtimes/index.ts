import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/overtimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
export const update = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/portal/api/overtimes/{overtime}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
update.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
export const destroy = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/portal/api/overtimes/{overtime}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
destroy.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
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
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
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

const overtimes = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default overtimes