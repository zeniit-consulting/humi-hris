import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/reprimands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
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

const reprimands = {
    index: Object.assign(index, index),
}

export default reprimands