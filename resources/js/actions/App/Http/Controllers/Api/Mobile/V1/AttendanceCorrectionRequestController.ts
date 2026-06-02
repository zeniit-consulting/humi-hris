import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/attendance-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:19
* @route '/portal/api/attendance-requests'
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

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:40
* @route '/portal/api/attendance-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/attendance-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:40
* @route '/portal/api/attendance-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:40
* @route '/portal/api/attendance-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:40
* @route '/portal/api/attendance-requests'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:40
* @route '/portal/api/attendance-requests'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const AttendanceCorrectionRequestController = { index, store }

export default AttendanceCorrectionRequestController