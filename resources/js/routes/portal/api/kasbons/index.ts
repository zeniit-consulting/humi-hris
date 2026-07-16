import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/kasbons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:22
* @route '/portal/api/kasbons'
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
* @route '/portal/api/kasbons'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/kasbons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/portal/api/kasbons'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/portal/api/kasbons'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/portal/api/kasbons'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:71
* @route '/portal/api/kasbons'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const kasbons = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default kasbons