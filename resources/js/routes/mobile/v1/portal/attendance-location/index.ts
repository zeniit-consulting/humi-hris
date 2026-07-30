import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::check
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:116
* @route '/api/mobile/v1/portal/attendance-location/check'
*/
export const check = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

check.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/portal/attendance-location/check',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::check
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:116
* @route '/api/mobile/v1/portal/attendance-location/check'
*/
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::check
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:116
* @route '/api/mobile/v1/portal/attendance-location/check'
*/
check.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: check.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::check
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:116
* @route '/api/mobile/v1/portal/attendance-location/check'
*/
const checkForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::check
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:116
* @route '/api/mobile/v1/portal/attendance-location/check'
*/
checkForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: check.url(options),
    method: 'post',
})

check.form = checkForm

const attendanceLocation = {
    check: Object.assign(check, check),
}

export default attendanceLocation