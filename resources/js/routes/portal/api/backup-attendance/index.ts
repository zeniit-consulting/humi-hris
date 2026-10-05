import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
export const colleagues = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues.url(options),
    method: 'get',
})

colleagues.definition = {
    methods: ["get","head"],
    url: '/portal/api/backup-attendance/colleagues',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues.url = (options?: RouteQueryOptions) => {
    return colleagues.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: colleagues.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
const colleaguesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
colleaguesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:33
* @route '/portal/api/backup-attendance/colleagues'
*/
colleaguesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

colleagues.form = colleaguesForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/portal/api/backup-attendance/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
statusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:109
* @route '/portal/api/backup-attendance/status'
*/
statusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status.form = statusForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:183
* @route '/portal/api/backup-attendance/check-in'
*/
export const checkIn = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn.url(options),
    method: 'post',
})

checkIn.definition = {
    methods: ["post"],
    url: '/portal/api/backup-attendance/check-in',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:183
* @route '/portal/api/backup-attendance/check-in'
*/
checkIn.url = (options?: RouteQueryOptions) => {
    return checkIn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:183
* @route '/portal/api/backup-attendance/check-in'
*/
checkIn.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:183
* @route '/portal/api/backup-attendance/check-in'
*/
const checkInForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:183
* @route '/portal/api/backup-attendance/check-in'
*/
checkInForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn.url(options),
    method: 'post',
})

checkIn.form = checkInForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:369
* @route '/portal/api/backup-attendance/check-out'
*/
export const checkOut = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut.url(options),
    method: 'post',
})

checkOut.definition = {
    methods: ["post"],
    url: '/portal/api/backup-attendance/check-out',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:369
* @route '/portal/api/backup-attendance/check-out'
*/
checkOut.url = (options?: RouteQueryOptions) => {
    return checkOut.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:369
* @route '/portal/api/backup-attendance/check-out'
*/
checkOut.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:369
* @route '/portal/api/backup-attendance/check-out'
*/
const checkOutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOut.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:369
* @route '/portal/api/backup-attendance/check-out'
*/
checkOutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOut.url(options),
    method: 'post',
})

checkOut.form = checkOutForm

const backupAttendance = {
    colleagues: Object.assign(colleagues, colleagues),
    status: Object.assign(status, status),
    checkIn: Object.assign(checkIn, checkIn),
    checkOut: Object.assign(checkOut, checkOut),
}

export default backupAttendance