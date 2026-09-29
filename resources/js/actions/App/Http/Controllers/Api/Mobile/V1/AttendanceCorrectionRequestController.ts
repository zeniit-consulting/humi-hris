import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
const indexd5ee8999dbf306e0cd78dd91319ac59c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexd5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'get',
})

indexd5ee8999dbf306e0cd78dd91319ac59c.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/attendance-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
indexd5ee8999dbf306e0cd78dd91319ac59c.url = (options?: RouteQueryOptions) => {
    return indexd5ee8999dbf306e0cd78dd91319ac59c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
indexd5ee8999dbf306e0cd78dd91319ac59c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexd5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
indexd5ee8999dbf306e0cd78dd91319ac59c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexd5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
const indexd5ee8999dbf306e0cd78dd91319ac59cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexd5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
indexd5ee8999dbf306e0cd78dd91319ac59cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexd5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/api/mobile/v1/portal/attendance-requests'
*/
indexd5ee8999dbf306e0cd78dd91319ac59cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexd5ee8999dbf306e0cd78dd91319ac59c.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexd5ee8999dbf306e0cd78dd91319ac59c.form = indexd5ee8999dbf306e0cd78dd91319ac59cForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
const indexcc3d5e13a1c4fef61d1e4c65543679da = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexcc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'get',
})

indexcc3d5e13a1c4fef61d1e4c65543679da.definition = {
    methods: ["get","head"],
    url: '/portal/api/attendance-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
indexcc3d5e13a1c4fef61d1e4c65543679da.url = (options?: RouteQueryOptions) => {
    return indexcc3d5e13a1c4fef61d1e4c65543679da.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
indexcc3d5e13a1c4fef61d1e4c65543679da.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexcc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
indexcc3d5e13a1c4fef61d1e4c65543679da.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexcc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
const indexcc3d5e13a1c4fef61d1e4c65543679daForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexcc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
indexcc3d5e13a1c4fef61d1e4c65543679daForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexcc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:22
* @route '/portal/api/attendance-requests'
*/
indexcc3d5e13a1c4fef61d1e4c65543679daForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexcc3d5e13a1c4fef61d1e4c65543679da.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexcc3d5e13a1c4fef61d1e4c65543679da.form = indexcc3d5e13a1c4fef61d1e4c65543679daForm

export const index = {
    '/api/mobile/v1/portal/attendance-requests': indexd5ee8999dbf306e0cd78dd91319ac59c,
    '/portal/api/attendance-requests': indexcc3d5e13a1c4fef61d1e4c65543679da,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/api/mobile/v1/portal/attendance-requests'
*/
const stored5ee8999dbf306e0cd78dd91319ac59c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stored5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'post',
})

stored5ee8999dbf306e0cd78dd91319ac59c.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/portal/attendance-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/api/mobile/v1/portal/attendance-requests'
*/
stored5ee8999dbf306e0cd78dd91319ac59c.url = (options?: RouteQueryOptions) => {
    return stored5ee8999dbf306e0cd78dd91319ac59c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/api/mobile/v1/portal/attendance-requests'
*/
stored5ee8999dbf306e0cd78dd91319ac59c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stored5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/api/mobile/v1/portal/attendance-requests'
*/
const stored5ee8999dbf306e0cd78dd91319ac59cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stored5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/api/mobile/v1/portal/attendance-requests'
*/
stored5ee8999dbf306e0cd78dd91319ac59cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stored5ee8999dbf306e0cd78dd91319ac59c.url(options),
    method: 'post',
})

stored5ee8999dbf306e0cd78dd91319ac59c.form = stored5ee8999dbf306e0cd78dd91319ac59cForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/portal/api/attendance-requests'
*/
const storecc3d5e13a1c4fef61d1e4c65543679da = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storecc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'post',
})

storecc3d5e13a1c4fef61d1e4c65543679da.definition = {
    methods: ["post"],
    url: '/portal/api/attendance-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/portal/api/attendance-requests'
*/
storecc3d5e13a1c4fef61d1e4c65543679da.url = (options?: RouteQueryOptions) => {
    return storecc3d5e13a1c4fef61d1e4c65543679da.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/portal/api/attendance-requests'
*/
storecc3d5e13a1c4fef61d1e4c65543679da.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storecc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/portal/api/attendance-requests'
*/
const storecc3d5e13a1c4fef61d1e4c65543679daForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storecc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceCorrectionRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceCorrectionRequestController.php:44
* @route '/portal/api/attendance-requests'
*/
storecc3d5e13a1c4fef61d1e4c65543679daForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storecc3d5e13a1c4fef61d1e4c65543679da.url(options),
    method: 'post',
})

storecc3d5e13a1c4fef61d1e4c65543679da.form = storecc3d5e13a1c4fef61d1e4c65543679daForm

export const store = {
    '/api/mobile/v1/portal/attendance-requests': stored5ee8999dbf306e0cd78dd91319ac59c,
    '/portal/api/attendance-requests': storecc3d5e13a1c4fef61d1e4c65543679da,
}

const AttendanceCorrectionRequestController = { index, store }

export default AttendanceCorrectionRequestController