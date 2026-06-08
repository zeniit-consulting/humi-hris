import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import checkIns from './check-ins'
/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/performances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
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

const performances = {
    index: Object.assign(index, index),
    checkIns: Object.assign(checkIns, checkIns),
}

export default performances