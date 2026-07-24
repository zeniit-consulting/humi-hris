import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/attendance-approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::index
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:19
* @route '/hris/attendance-approvals'
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
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::approve
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:76
* @route '/hris/attendance-approvals/{attendanceRequest}/approve'
*/
export const approve = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/attendance-approvals/{attendanceRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::approve
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:76
* @route '/hris/attendance-approvals/{attendanceRequest}/approve'
*/
approve.url = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attendanceRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { attendanceRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            attendanceRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        attendanceRequest: typeof args.attendanceRequest === 'object'
        ? args.attendanceRequest.id
        : args.attendanceRequest,
    }

    return approve.definition.url
            .replace('{attendanceRequest}', parsedArgs.attendanceRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::approve
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:76
* @route '/hris/attendance-approvals/{attendanceRequest}/approve'
*/
approve.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::approve
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:76
* @route '/hris/attendance-approvals/{attendanceRequest}/approve'
*/
const approveForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::approve
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:76
* @route '/hris/attendance-approvals/{attendanceRequest}/approve'
*/
approveForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::reject
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:111
* @route '/hris/attendance-approvals/{attendanceRequest}/reject'
*/
export const reject = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/attendance-approvals/{attendanceRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::reject
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:111
* @route '/hris/attendance-approvals/{attendanceRequest}/reject'
*/
reject.url = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { attendanceRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { attendanceRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            attendanceRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        attendanceRequest: typeof args.attendanceRequest === 'object'
        ? args.attendanceRequest.id
        : args.attendanceRequest,
    }

    return reject.definition.url
            .replace('{attendanceRequest}', parsedArgs.attendanceRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::reject
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:111
* @route '/hris/attendance-approvals/{attendanceRequest}/reject'
*/
reject.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::reject
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:111
* @route '/hris/attendance-approvals/{attendanceRequest}/reject'
*/
const rejectForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceCorrectionApprovalController::reject
* @see app/Http/Controllers/Hris/AttendanceCorrectionApprovalController.php:111
* @route '/hris/attendance-approvals/{attendanceRequest}/reject'
*/
rejectForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const attendanceApprovals = {
    index: Object.assign(index, index),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default attendanceApprovals