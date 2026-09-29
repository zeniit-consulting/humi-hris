import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
const colleagues124785f1caad9378ce221022b2f6af59 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues124785f1caad9378ce221022b2f6af59.url(options),
    method: 'get',
})

colleagues124785f1caad9378ce221022b2f6af59.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/backup-attendance/colleagues',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
colleagues124785f1caad9378ce221022b2f6af59.url = (options?: RouteQueryOptions) => {
    return colleagues124785f1caad9378ce221022b2f6af59.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
colleagues124785f1caad9378ce221022b2f6af59.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues124785f1caad9378ce221022b2f6af59.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
colleagues124785f1caad9378ce221022b2f6af59.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: colleagues124785f1caad9378ce221022b2f6af59.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
const colleagues124785f1caad9378ce221022b2f6af59Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues124785f1caad9378ce221022b2f6af59.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
colleagues124785f1caad9378ce221022b2f6af59Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues124785f1caad9378ce221022b2f6af59.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/api/mobile/v1/portal/backup-attendance/colleagues'
*/
colleagues124785f1caad9378ce221022b2f6af59Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues124785f1caad9378ce221022b2f6af59.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

colleagues124785f1caad9378ce221022b2f6af59.form = colleagues124785f1caad9378ce221022b2f6af59Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
const colleagues45ca8e508092b4786a0aa4e458a3fc81 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues45ca8e508092b4786a0aa4e458a3fc81.url(options),
    method: 'get',
})

colleagues45ca8e508092b4786a0aa4e458a3fc81.definition = {
    methods: ["get","head"],
    url: '/portal/api/backup-attendance/colleagues',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues45ca8e508092b4786a0aa4e458a3fc81.url = (options?: RouteQueryOptions) => {
    return colleagues45ca8e508092b4786a0aa4e458a3fc81.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues45ca8e508092b4786a0aa4e458a3fc81.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: colleagues45ca8e508092b4786a0aa4e458a3fc81.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues45ca8e508092b4786a0aa4e458a3fc81.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: colleagues45ca8e508092b4786a0aa4e458a3fc81.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
const colleagues45ca8e508092b4786a0aa4e458a3fc81Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues45ca8e508092b4786a0aa4e458a3fc81.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues45ca8e508092b4786a0aa4e458a3fc81Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues45ca8e508092b4786a0aa4e458a3fc81.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::colleagues
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:31
* @route '/portal/api/backup-attendance/colleagues'
*/
colleagues45ca8e508092b4786a0aa4e458a3fc81Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: colleagues45ca8e508092b4786a0aa4e458a3fc81.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

colleagues45ca8e508092b4786a0aa4e458a3fc81.form = colleagues45ca8e508092b4786a0aa4e458a3fc81Form

export const colleagues = {
    '/api/mobile/v1/portal/backup-attendance/colleagues': colleagues124785f1caad9378ce221022b2f6af59,
    '/portal/api/backup-attendance/colleagues': colleagues45ca8e508092b4786a0aa4e458a3fc81,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
const statuscdaa02e9a73d0c28cc19735d01bb7b8b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url(options),
    method: 'get',
})

statuscdaa02e9a73d0c28cc19735d01bb7b8b.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/backup-attendance/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
statuscdaa02e9a73d0c28cc19735d01bb7b8b.url = (options?: RouteQueryOptions) => {
    return statuscdaa02e9a73d0c28cc19735d01bb7b8b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
statuscdaa02e9a73d0c28cc19735d01bb7b8b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
statuscdaa02e9a73d0c28cc19735d01bb7b8b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
const statuscdaa02e9a73d0c28cc19735d01bb7b8bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
statuscdaa02e9a73d0c28cc19735d01bb7b8bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/api/mobile/v1/portal/backup-attendance/status'
*/
statuscdaa02e9a73d0c28cc19735d01bb7b8bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: statuscdaa02e9a73d0c28cc19735d01bb7b8b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

statuscdaa02e9a73d0c28cc19735d01bb7b8b.form = statuscdaa02e9a73d0c28cc19735d01bb7b8bForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
const status47b2ae39cba0ea7cdbf776c714c50854 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status47b2ae39cba0ea7cdbf776c714c50854.url(options),
    method: 'get',
})

status47b2ae39cba0ea7cdbf776c714c50854.definition = {
    methods: ["get","head"],
    url: '/portal/api/backup-attendance/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
status47b2ae39cba0ea7cdbf776c714c50854.url = (options?: RouteQueryOptions) => {
    return status47b2ae39cba0ea7cdbf776c714c50854.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
status47b2ae39cba0ea7cdbf776c714c50854.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status47b2ae39cba0ea7cdbf776c714c50854.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
status47b2ae39cba0ea7cdbf776c714c50854.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status47b2ae39cba0ea7cdbf776c714c50854.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
const status47b2ae39cba0ea7cdbf776c714c50854Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status47b2ae39cba0ea7cdbf776c714c50854.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
status47b2ae39cba0ea7cdbf776c714c50854Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status47b2ae39cba0ea7cdbf776c714c50854.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::status
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:107
* @route '/portal/api/backup-attendance/status'
*/
status47b2ae39cba0ea7cdbf776c714c50854Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status47b2ae39cba0ea7cdbf776c714c50854.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status47b2ae39cba0ea7cdbf776c714c50854.form = status47b2ae39cba0ea7cdbf776c714c50854Form

export const status = {
    '/api/mobile/v1/portal/backup-attendance/status': statuscdaa02e9a73d0c28cc19735d01bb7b8b,
    '/portal/api/backup-attendance/status': status47b2ae39cba0ea7cdbf776c714c50854,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/api/mobile/v1/portal/backup-attendance/check-in'
*/
const checkIn2c006f595260e2e27dda1dccc9a8562d = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn2c006f595260e2e27dda1dccc9a8562d.url(options),
    method: 'post',
})

checkIn2c006f595260e2e27dda1dccc9a8562d.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/portal/backup-attendance/check-in',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/api/mobile/v1/portal/backup-attendance/check-in'
*/
checkIn2c006f595260e2e27dda1dccc9a8562d.url = (options?: RouteQueryOptions) => {
    return checkIn2c006f595260e2e27dda1dccc9a8562d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/api/mobile/v1/portal/backup-attendance/check-in'
*/
checkIn2c006f595260e2e27dda1dccc9a8562d.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn2c006f595260e2e27dda1dccc9a8562d.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/api/mobile/v1/portal/backup-attendance/check-in'
*/
const checkIn2c006f595260e2e27dda1dccc9a8562dForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn2c006f595260e2e27dda1dccc9a8562d.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/api/mobile/v1/portal/backup-attendance/check-in'
*/
checkIn2c006f595260e2e27dda1dccc9a8562dForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn2c006f595260e2e27dda1dccc9a8562d.url(options),
    method: 'post',
})

checkIn2c006f595260e2e27dda1dccc9a8562d.form = checkIn2c006f595260e2e27dda1dccc9a8562dForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/portal/api/backup-attendance/check-in'
*/
const checkIn8ddc5e99369025570053f7bce59597fe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn8ddc5e99369025570053f7bce59597fe.url(options),
    method: 'post',
})

checkIn8ddc5e99369025570053f7bce59597fe.definition = {
    methods: ["post"],
    url: '/portal/api/backup-attendance/check-in',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/portal/api/backup-attendance/check-in'
*/
checkIn8ddc5e99369025570053f7bce59597fe.url = (options?: RouteQueryOptions) => {
    return checkIn8ddc5e99369025570053f7bce59597fe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/portal/api/backup-attendance/check-in'
*/
checkIn8ddc5e99369025570053f7bce59597fe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkIn8ddc5e99369025570053f7bce59597fe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/portal/api/backup-attendance/check-in'
*/
const checkIn8ddc5e99369025570053f7bce59597feForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn8ddc5e99369025570053f7bce59597fe.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkIn
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:181
* @route '/portal/api/backup-attendance/check-in'
*/
checkIn8ddc5e99369025570053f7bce59597feForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkIn8ddc5e99369025570053f7bce59597fe.url(options),
    method: 'post',
})

checkIn8ddc5e99369025570053f7bce59597fe.form = checkIn8ddc5e99369025570053f7bce59597feForm

export const checkIn = {
    '/api/mobile/v1/portal/backup-attendance/check-in': checkIn2c006f595260e2e27dda1dccc9a8562d,
    '/portal/api/backup-attendance/check-in': checkIn8ddc5e99369025570053f7bce59597fe,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/api/mobile/v1/portal/backup-attendance/check-out'
*/
const checkOut04b3a7ee03cf31c5e17d90123eee0178 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut04b3a7ee03cf31c5e17d90123eee0178.url(options),
    method: 'post',
})

checkOut04b3a7ee03cf31c5e17d90123eee0178.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/portal/backup-attendance/check-out',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/api/mobile/v1/portal/backup-attendance/check-out'
*/
checkOut04b3a7ee03cf31c5e17d90123eee0178.url = (options?: RouteQueryOptions) => {
    return checkOut04b3a7ee03cf31c5e17d90123eee0178.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/api/mobile/v1/portal/backup-attendance/check-out'
*/
checkOut04b3a7ee03cf31c5e17d90123eee0178.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOut04b3a7ee03cf31c5e17d90123eee0178.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/api/mobile/v1/portal/backup-attendance/check-out'
*/
const checkOut04b3a7ee03cf31c5e17d90123eee0178Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOut04b3a7ee03cf31c5e17d90123eee0178.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/api/mobile/v1/portal/backup-attendance/check-out'
*/
checkOut04b3a7ee03cf31c5e17d90123eee0178Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOut04b3a7ee03cf31c5e17d90123eee0178.url(options),
    method: 'post',
})

checkOut04b3a7ee03cf31c5e17d90123eee0178.form = checkOut04b3a7ee03cf31c5e17d90123eee0178Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/portal/api/backup-attendance/check-out'
*/
const checkOutd48e7079beb59761a43199147eec36de = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOutd48e7079beb59761a43199147eec36de.url(options),
    method: 'post',
})

checkOutd48e7079beb59761a43199147eec36de.definition = {
    methods: ["post"],
    url: '/portal/api/backup-attendance/check-out',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/portal/api/backup-attendance/check-out'
*/
checkOutd48e7079beb59761a43199147eec36de.url = (options?: RouteQueryOptions) => {
    return checkOutd48e7079beb59761a43199147eec36de.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/portal/api/backup-attendance/check-out'
*/
checkOutd48e7079beb59761a43199147eec36de.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkOutd48e7079beb59761a43199147eec36de.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/portal/api/backup-attendance/check-out'
*/
const checkOutd48e7079beb59761a43199147eec36deForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOutd48e7079beb59761a43199147eec36de.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\BackupAttendanceController::checkOut
* @see app/Http/Controllers/Api/Mobile/V1/BackupAttendanceController.php:373
* @route '/portal/api/backup-attendance/check-out'
*/
checkOutd48e7079beb59761a43199147eec36deForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkOutd48e7079beb59761a43199147eec36de.url(options),
    method: 'post',
})

checkOutd48e7079beb59761a43199147eec36de.form = checkOutd48e7079beb59761a43199147eec36deForm

export const checkOut = {
    '/api/mobile/v1/portal/backup-attendance/check-out': checkOut04b3a7ee03cf31c5e17d90123eee0178,
    '/portal/api/backup-attendance/check-out': checkOutd48e7079beb59761a43199147eec36de,
}

const BackupAttendanceController = { colleagues, status, checkIn, checkOut }

export default BackupAttendanceController