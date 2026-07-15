import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:110
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
export const approve = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/client/approvals/attendance/{attendanceRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:110
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
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
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:110
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
approve.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:110
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
const approveForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:110
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
approveForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:141
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
export const reject = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/client/approvals/attendance/{attendanceRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:141
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
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
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:141
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
reject.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:141
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
const rejectForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:141
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
rejectForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const attendance = {
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default attendance