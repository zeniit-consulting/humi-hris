import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/client/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:21
* @route '/client/approvals'
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
* @see \App\Http\Controllers\Client\ApprovalController::approveAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:93
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
export const approveAttendance = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveAttendance.url(args, options),
    method: 'post',
})

approveAttendance.definition = {
    methods: ["post"],
    url: '/client/approvals/attendance/{attendanceRequest}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:93
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
approveAttendance.url = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return approveAttendance.definition.url
            .replace('{attendanceRequest}', parsedArgs.attendanceRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:93
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
approveAttendance.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:93
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
const approveAttendanceForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:93
* @route '/client/approvals/attendance/{attendanceRequest}/approve'
*/
approveAttendanceForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveAttendance.url(args, options),
    method: 'post',
})

approveAttendance.form = approveAttendanceForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:124
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
export const rejectAttendance = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectAttendance.url(args, options),
    method: 'post',
})

rejectAttendance.definition = {
    methods: ["post"],
    url: '/client/approvals/attendance/{attendanceRequest}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:124
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
rejectAttendance.url = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return rejectAttendance.definition.url
            .replace('{attendanceRequest}', parsedArgs.attendanceRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:124
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
rejectAttendance.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:124
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
const rejectAttendanceForm = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectAttendance
* @see app/Http/Controllers/Client/ApprovalController.php:124
* @route '/client/approvals/attendance/{attendanceRequest}/reject'
*/
rejectAttendanceForm.post = (args: { attendanceRequest: number | { id: number } } | [attendanceRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectAttendance.url(args, options),
    method: 'post',
})

rejectAttendance.form = rejectAttendanceForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveLeave
* @see app/Http/Controllers/Client/ApprovalController.php:132
* @route '/client/approvals/leaves/{leave}/approve'
*/
export const approveLeave = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveLeave.url(args, options),
    method: 'post',
})

approveLeave.definition = {
    methods: ["post"],
    url: '/client/approvals/leaves/{leave}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveLeave
* @see app/Http/Controllers/Client/ApprovalController.php:132
* @route '/client/approvals/leaves/{leave}/approve'
*/
approveLeave.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return approveLeave.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveLeave
* @see app/Http/Controllers/Client/ApprovalController.php:132
* @route '/client/approvals/leaves/{leave}/approve'
*/
approveLeave.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveLeave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveLeave
* @see app/Http/Controllers/Client/ApprovalController.php:132
* @route '/client/approvals/leaves/{leave}/approve'
*/
const approveLeaveForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveLeave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveLeave
* @see app/Http/Controllers/Client/ApprovalController.php:132
* @route '/client/approvals/leaves/{leave}/approve'
*/
approveLeaveForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveLeave.url(args, options),
    method: 'post',
})

approveLeave.form = approveLeaveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectLeave
* @see app/Http/Controllers/Client/ApprovalController.php:149
* @route '/client/approvals/leaves/{leave}/reject'
*/
export const rejectLeave = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectLeave.url(args, options),
    method: 'post',
})

rejectLeave.definition = {
    methods: ["post"],
    url: '/client/approvals/leaves/{leave}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectLeave
* @see app/Http/Controllers/Client/ApprovalController.php:149
* @route '/client/approvals/leaves/{leave}/reject'
*/
rejectLeave.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return rejectLeave.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectLeave
* @see app/Http/Controllers/Client/ApprovalController.php:149
* @route '/client/approvals/leaves/{leave}/reject'
*/
rejectLeave.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectLeave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectLeave
* @see app/Http/Controllers/Client/ApprovalController.php:149
* @route '/client/approvals/leaves/{leave}/reject'
*/
const rejectLeaveForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectLeave.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectLeave
* @see app/Http/Controllers/Client/ApprovalController.php:149
* @route '/client/approvals/leaves/{leave}/reject'
*/
rejectLeaveForm.post = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectLeave.url(args, options),
    method: 'post',
})

rejectLeave.form = rejectLeaveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:161
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
export const approveOvertime = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveOvertime.url(args, options),
    method: 'post',
})

approveOvertime.definition = {
    methods: ["post"],
    url: '/client/approvals/overtimes/{overtime}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:161
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approveOvertime.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return approveOvertime.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:161
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approveOvertime.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approveOvertime.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:161
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
const approveOvertimeForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveOvertime.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approveOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:161
* @route '/client/approvals/overtimes/{overtime}/approve'
*/
approveOvertimeForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approveOvertime.url(args, options),
    method: 'post',
})

approveOvertime.form = approveOvertimeForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:174
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
export const rejectOvertime = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectOvertime.url(args, options),
    method: 'post',
})

rejectOvertime.definition = {
    methods: ["post"],
    url: '/client/approvals/overtimes/{overtime}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:174
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
rejectOvertime.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return rejectOvertime.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:174
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
rejectOvertime.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectOvertime.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:174
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
const rejectOvertimeForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectOvertime.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::rejectOvertime
* @see app/Http/Controllers/Client/ApprovalController.php:174
* @route '/client/approvals/overtimes/{overtime}/reject'
*/
rejectOvertimeForm.post = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: rejectOvertime.url(args, options),
    method: 'post',
})

rejectOvertime.form = rejectOvertimeForm

const ApprovalController = { index, approveAttendance, rejectAttendance, approveLeave, rejectLeave, approveOvertime, rejectOvertime }

export default ApprovalController