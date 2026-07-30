import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import attendanceLocation from './attendance-location'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
const summaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

summary.form = summaryForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
export const attendancePolicy = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendancePolicy.url(options),
    method: 'get',
})

attendancePolicy.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/attendance-policy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
attendancePolicy.url = (options?: RouteQueryOptions) => {
    return attendancePolicy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
attendancePolicy.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendancePolicy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
attendancePolicy.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendancePolicy.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
const attendancePolicyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendancePolicy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
attendancePolicyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendancePolicy.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::attendancePolicy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:104
* @route '/api/mobile/v1/portal/attendance-policy'
*/
attendancePolicyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendancePolicy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

attendancePolicy.form = attendancePolicyForm

const portal = {
    summary: Object.assign(summary, summary),
    attendancePolicy: Object.assign(attendancePolicy, attendancePolicy),
    attendanceLocation: Object.assign(attendanceLocation, attendanceLocation),
}

export default portal