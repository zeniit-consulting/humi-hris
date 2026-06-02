import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
export const options = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})

options.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/master/options',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
options.url = (options?: RouteQueryOptions) => {
    return options.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
options.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: options.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
options.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: options.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
const optionsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: options.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
optionsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: options.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\MasterController::options
* @see app/Http/Controllers/Api/Mobile/V1/MasterController.php:16
* @route '/api/mobile/v1/master/options'
*/
optionsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: options.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

options.form = optionsForm

const master = {
    options: Object.assign(options, options),
}

export default master