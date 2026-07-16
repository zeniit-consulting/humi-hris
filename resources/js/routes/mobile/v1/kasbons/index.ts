import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/kasbons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/api/mobile/v1/kasbons'
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
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/api/mobile/v1/kasbons'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/kasbons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/api/mobile/v1/kasbons'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/api/mobile/v1/kasbons'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/api/mobile/v1/kasbons'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/api/mobile/v1/kasbons'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:111
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
export const update = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/kasbons/{employeeDeduction}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:111
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
update.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeDeduction: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeDeduction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeDeduction: typeof args.employeeDeduction === 'object'
        ? args.employeeDeduction.id
        : args.employeeDeduction,
    }

    return update.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:111
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
update.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:111
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
const updateForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:111
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
updateForm.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:133
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
export const destroy = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/kasbons/{employeeDeduction}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:133
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroy.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeDeduction: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeDeduction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeDeduction: typeof args.employeeDeduction === 'object'
        ? args.employeeDeduction.id
        : args.employeeDeduction,
    }

    return destroy.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:133
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroy.delete = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:133
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
const destroyForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:133
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroyForm.delete = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const kasbons = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default kasbons