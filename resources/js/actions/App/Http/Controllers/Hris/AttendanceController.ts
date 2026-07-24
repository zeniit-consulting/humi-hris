import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/attendances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::index
* @see app/Http/Controllers/Hris/AttendanceController.php:26
* @route '/hris/attendances'
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
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/hris/attendances/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::exportMethod
* @see app/Http/Controllers/Hris/AttendanceController.php:281
* @route '/hris/attendances/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
export const showMonthly = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMonthly.url(args, options),
    method: 'get',
})

showMonthly.definition = {
    methods: ["get","head"],
    url: '/hris/attendances/employees/{employee}/monthly',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
showMonthly.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return showMonthly.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
showMonthly.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showMonthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
showMonthly.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showMonthly.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
const showMonthlyForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showMonthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
showMonthlyForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showMonthly.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::showMonthly
* @see app/Http/Controllers/Hris/AttendanceController.php:130
* @route '/hris/attendances/employees/{employee}/monthly'
*/
showMonthlyForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showMonthly.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showMonthly.form = showMonthlyForm

/**
* @see \App\Http\Controllers\Hris\AttendanceController::store
* @see app/Http/Controllers/Hris/AttendanceController.php:225
* @route '/hris/attendances'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/attendances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::store
* @see app/Http/Controllers/Hris/AttendanceController.php:225
* @route '/hris/attendances'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::store
* @see app/Http/Controllers/Hris/AttendanceController.php:225
* @route '/hris/attendances'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::store
* @see app/Http/Controllers/Hris/AttendanceController.php:225
* @route '/hris/attendances'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::store
* @see app/Http/Controllers/Hris/AttendanceController.php:225
* @route '/hris/attendances'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\AttendanceController::update
* @see app/Http/Controllers/Hris/AttendanceController.php:255
* @route '/hris/attendances/{employeeAttendance}'
*/
export const update = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::update
* @see app/Http/Controllers/Hris/AttendanceController.php:255
* @route '/hris/attendances/{employeeAttendance}'
*/
update.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::update
* @see app/Http/Controllers/Hris/AttendanceController.php:255
* @route '/hris/attendances/{employeeAttendance}'
*/
update.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::update
* @see app/Http/Controllers/Hris/AttendanceController.php:255
* @route '/hris/attendances/{employeeAttendance}'
*/
const updateForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::update
* @see app/Http/Controllers/Hris/AttendanceController.php:255
* @route '/hris/attendances/{employeeAttendance}'
*/
updateForm.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Hris\AttendanceController::destroy
* @see app/Http/Controllers/Hris/AttendanceController.php:271
* @route '/hris/attendances/{employeeAttendance}'
*/
export const destroy = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\AttendanceController::destroy
* @see app/Http/Controllers/Hris/AttendanceController.php:271
* @route '/hris/attendances/{employeeAttendance}'
*/
destroy.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\AttendanceController::destroy
* @see app/Http/Controllers/Hris/AttendanceController.php:271
* @route '/hris/attendances/{employeeAttendance}'
*/
destroy.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::destroy
* @see app/Http/Controllers/Hris/AttendanceController.php:271
* @route '/hris/attendances/{employeeAttendance}'
*/
const destroyForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\AttendanceController::destroy
* @see app/Http/Controllers/Hris/AttendanceController.php:271
* @route '/hris/attendances/{employeeAttendance}'
*/
destroyForm.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const AttendanceController = { index, exportMethod, showMonthly, store, update, destroy, export: exportMethod }

export default AttendanceController