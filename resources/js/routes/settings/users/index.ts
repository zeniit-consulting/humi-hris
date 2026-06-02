import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/users',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::index
* @see app/Http/Controllers/Settings/SubUserController.php:20
* @route '/settings/users'
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
* @see \App\Http\Controllers\Settings\SubUserController::store
* @see app/Http/Controllers/Settings/SubUserController.php:72
* @route '/settings/users'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/users',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\SubUserController::store
* @see app/Http/Controllers/Settings/SubUserController.php:72
* @route '/settings/users'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SubUserController::store
* @see app/Http/Controllers/Settings/SubUserController.php:72
* @route '/settings/users'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::store
* @see app/Http/Controllers/Settings/SubUserController.php:72
* @route '/settings/users'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::store
* @see app/Http/Controllers/Settings/SubUserController.php:72
* @route '/settings/users'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Settings\SubUserController::update
* @see app/Http/Controllers/Settings/SubUserController.php:100
* @route '/settings/users/{subUser}'
*/
export const update = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/settings/users/{subUser}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\SubUserController::update
* @see app/Http/Controllers/Settings/SubUserController.php:100
* @route '/settings/users/{subUser}'
*/
update.url = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subUser: args }
    }

    if (Array.isArray(args)) {
        args = {
            subUser: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subUser: args.subUser,
    }

    return update.definition.url
            .replace('{subUser}', parsedArgs.subUser.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SubUserController::update
* @see app/Http/Controllers/Settings/SubUserController.php:100
* @route '/settings/users/{subUser}'
*/
update.put = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::update
* @see app/Http/Controllers/Settings/SubUserController.php:100
* @route '/settings/users/{subUser}'
*/
const updateForm = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::update
* @see app/Http/Controllers/Settings/SubUserController.php:100
* @route '/settings/users/{subUser}'
*/
updateForm.put = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Settings\SubUserController::destroy
* @see app/Http/Controllers/Settings/SubUserController.php:130
* @route '/settings/users/{subUser}'
*/
export const destroy = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/users/{subUser}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\SubUserController::destroy
* @see app/Http/Controllers/Settings/SubUserController.php:130
* @route '/settings/users/{subUser}'
*/
destroy.url = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subUser: args }
    }

    if (Array.isArray(args)) {
        args = {
            subUser: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subUser: args.subUser,
    }

    return destroy.definition.url
            .replace('{subUser}', parsedArgs.subUser.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SubUserController::destroy
* @see app/Http/Controllers/Settings/SubUserController.php:130
* @route '/settings/users/{subUser}'
*/
destroy.delete = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::destroy
* @see app/Http/Controllers/Settings/SubUserController.php:130
* @route '/settings/users/{subUser}'
*/
const destroyForm = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\SubUserController::destroy
* @see app/Http/Controllers/Settings/SubUserController.php:130
* @route '/settings/users/{subUser}'
*/
destroyForm.delete = (args: { subUser: string | number } | [subUser: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const users = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default users