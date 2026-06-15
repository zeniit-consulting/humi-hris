import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\OvertimeController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/OvertimeController.php:16
* @route '/api/third-party/v1/overtimes'
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

const OvertimeController = { index }

export default OvertimeController