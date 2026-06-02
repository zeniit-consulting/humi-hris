import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import responses from './responses'
/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/surveys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::index
* @see app/Http/Controllers/Api/PortalResourceController.php:64
* @route '/portal/api/surveys'
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

const surveys = {
    index: Object.assign(index, index),
    responses: Object.assign(responses, responses),
}

export default surveys