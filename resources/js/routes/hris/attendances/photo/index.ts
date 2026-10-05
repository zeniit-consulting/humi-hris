import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\AttendanceController::upload
* @see app/Http/Controllers/Hris/AttendanceController.php:417
* @route '/hris/attendances/{employeeAttendance}/photo'
*/
export const upload = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(args, options),
    method: 'post',
})

upload.definition = {
    methods: ["post"],
    url: '/hris/attendances/{employeeAttendance}/photo',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::upload
* @see app/Http/Controllers/Hris/AttendanceController.php:417
* @route '/hris/attendances/{employeeAttendance}/photo'
*/
upload.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return upload.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::upload
* @see app/Http/Controllers/Hris/AttendanceController.php:417
* @route '/hris/attendances/{employeeAttendance}/photo'
*/
upload.post = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: upload.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::upload
* @see app/Http/Controllers/Hris/AttendanceController.php:417
* @route '/hris/attendances/{employeeAttendance}/photo'
*/
const uploadForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::upload
* @see app/Http/Controllers/Hris/AttendanceController.php:417
* @route '/hris/attendances/{employeeAttendance}/photo'
*/
uploadForm.post = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: upload.url(args, options),
    method: 'post',
})

upload.form = uploadForm

const photo = {
    upload: Object.assign(upload, upload),
}

export default photo