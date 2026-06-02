import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/leaves',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
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
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/leaves',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
export const update = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/portal/api/leaves/{leave}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
update.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
update.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
const updateForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
updateForm.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
export const destroy = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/portal/api/leaves/{leave}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroy.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroy.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
const destroyForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroyForm.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const leaves = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default leaves