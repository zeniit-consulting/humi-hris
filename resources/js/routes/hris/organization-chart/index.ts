import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/organization-chart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::index
* @see app/Http/Controllers/Hris/OrganizationChartController.php:16
* @route '/hris/organization-chart'
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

const organizationChart = {
    index: Object.assign(index, index),
}

export default organizationChart