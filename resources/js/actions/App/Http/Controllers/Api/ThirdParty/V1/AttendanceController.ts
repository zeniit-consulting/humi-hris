import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/attendances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AttendanceController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/AttendanceController.php:16
* @route '/api/third-party/v1/attendances'
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

const AttendanceController = { index }

export default AttendanceController