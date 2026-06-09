import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/client-visits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientVisitController::index
* @see app/Http/Controllers/Hris/ClientVisitController.php:18
* @route '/hris/client-visits'
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

const clientVisits = {
    index: Object.assign(index, index),
}

export default clientVisits