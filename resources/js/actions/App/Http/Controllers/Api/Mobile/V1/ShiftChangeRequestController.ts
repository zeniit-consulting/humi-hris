import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
const index34a4fed740d0abcc347dbfdd926ab6e4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'get',
})

index34a4fed740d0abcc347dbfdd926ab6e4.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/shift-change-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
index34a4fed740d0abcc347dbfdd926ab6e4.url = (options?: RouteQueryOptions) => {
    return index34a4fed740d0abcc347dbfdd926ab6e4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
index34a4fed740d0abcc347dbfdd926ab6e4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
index34a4fed740d0abcc347dbfdd926ab6e4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
const index34a4fed740d0abcc347dbfdd926ab6e4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
index34a4fed740d0abcc347dbfdd926ab6e4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
index34a4fed740d0abcc347dbfdd926ab6e4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index34a4fed740d0abcc347dbfdd926ab6e4.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index34a4fed740d0abcc347dbfdd926ab6e4.form = index34a4fed740d0abcc347dbfdd926ab6e4Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
const index655670d710d1257f57c56ed2b0c65f86 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'get',
})

index655670d710d1257f57c56ed2b0c65f86.definition = {
    methods: ["get","head"],
    url: '/portal/api/shift-change-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
index655670d710d1257f57c56ed2b0c65f86.url = (options?: RouteQueryOptions) => {
    return index655670d710d1257f57c56ed2b0c65f86.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
index655670d710d1257f57c56ed2b0c65f86.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
index655670d710d1257f57c56ed2b0c65f86.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
const index655670d710d1257f57c56ed2b0c65f86Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
index655670d710d1257f57c56ed2b0c65f86Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::index
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:21
* @route '/portal/api/shift-change-requests'
*/
index655670d710d1257f57c56ed2b0c65f86Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index655670d710d1257f57c56ed2b0c65f86.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index655670d710d1257f57c56ed2b0c65f86.form = index655670d710d1257f57c56ed2b0c65f86Form

export const index = {
    '/api/mobile/v1/portal/shift-change-requests': index34a4fed740d0abcc347dbfdd926ab6e4,
    '/portal/api/shift-change-requests': index655670d710d1257f57c56ed2b0c65f86,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
const store34a4fed740d0abcc347dbfdd926ab6e4 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'post',
})

store34a4fed740d0abcc347dbfdd926ab6e4.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/portal/shift-change-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
store34a4fed740d0abcc347dbfdd926ab6e4.url = (options?: RouteQueryOptions) => {
    return store34a4fed740d0abcc347dbfdd926ab6e4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
store34a4fed740d0abcc347dbfdd926ab6e4.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
const store34a4fed740d0abcc347dbfdd926ab6e4Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/api/mobile/v1/portal/shift-change-requests'
*/
store34a4fed740d0abcc347dbfdd926ab6e4Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store34a4fed740d0abcc347dbfdd926ab6e4.url(options),
    method: 'post',
})

store34a4fed740d0abcc347dbfdd926ab6e4.form = store34a4fed740d0abcc347dbfdd926ab6e4Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/portal/api/shift-change-requests'
*/
const store655670d710d1257f57c56ed2b0c65f86 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'post',
})

store655670d710d1257f57c56ed2b0c65f86.definition = {
    methods: ["post"],
    url: '/portal/api/shift-change-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/portal/api/shift-change-requests'
*/
store655670d710d1257f57c56ed2b0c65f86.url = (options?: RouteQueryOptions) => {
    return store655670d710d1257f57c56ed2b0c65f86.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/portal/api/shift-change-requests'
*/
store655670d710d1257f57c56ed2b0c65f86.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/portal/api/shift-change-requests'
*/
const store655670d710d1257f57c56ed2b0c65f86Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ShiftChangeRequestController::store
* @see app/Http/Controllers/Api/Mobile/V1/ShiftChangeRequestController.php:41
* @route '/portal/api/shift-change-requests'
*/
store655670d710d1257f57c56ed2b0c65f86Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store655670d710d1257f57c56ed2b0c65f86.url(options),
    method: 'post',
})

store655670d710d1257f57c56ed2b0c65f86.form = store655670d710d1257f57c56ed2b0c65f86Form

export const store = {
    '/api/mobile/v1/portal/shift-change-requests': store34a4fed740d0abcc347dbfdd926ab6e4,
    '/portal/api/shift-change-requests': store655670d710d1257f57c56ed2b0c65f86,
}

const ShiftChangeRequestController = { index, store }

export default ShiftChangeRequestController