import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/company',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\CompanyController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/CompanyController.php:15
* @route '/api/third-party/v1/company'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

const CompanyController = { show }

export default CompanyController