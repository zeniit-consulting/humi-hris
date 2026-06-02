import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:20
* @route '/portal/api/announcements'
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

const announcements = {
    index: Object.assign(index, index),
}

export default announcements