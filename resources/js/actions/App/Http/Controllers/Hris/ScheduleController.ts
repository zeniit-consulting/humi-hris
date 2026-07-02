import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:29
* @route '/hris/schedules'
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
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:68
* @route '/hris/schedules'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:68
* @route '/hris/schedules'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:68
* @route '/hris/schedules'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:68
* @route '/hris/schedules'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:68
* @route '/hris/schedules'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:267
* @route '/hris/schedules/{employeeSchedule}'
*/
export const destroySchedule = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySchedule.url(args, options),
    method: 'delete',
})

destroySchedule.definition = {
    methods: ["delete"],
    url: '/hris/schedules/{employeeSchedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:267
* @route '/hris/schedules/{employeeSchedule}'
*/
destroySchedule.url = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeSchedule: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeSchedule: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeSchedule: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeSchedule: typeof args.employeeSchedule === 'object'
        ? args.employeeSchedule.id
        : args.employeeSchedule,
    }

    return destroySchedule.definition.url
            .replace('{employeeSchedule}', parsedArgs.employeeSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:267
* @route '/hris/schedules/{employeeSchedule}'
*/
destroySchedule.delete = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySchedule.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:267
* @route '/hris/schedules/{employeeSchedule}'
*/
const destroyScheduleForm = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroySchedule.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:267
* @route '/hris/schedules/{employeeSchedule}'
*/
destroyScheduleForm.delete = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroySchedule.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroySchedule.form = destroyScheduleForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
export const syncHolidays = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncHolidays.url(options),
    method: 'post',
})

syncHolidays.definition = {
    methods: ["post"],
    url: '/hris/schedules/holidays/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
syncHolidays.url = (options?: RouteQueryOptions) => {
    return syncHolidays.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
syncHolidays.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncHolidays.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
const syncHolidaysForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncHolidays.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
syncHolidaysForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncHolidays.url(options),
    method: 'post',
})

syncHolidays.form = syncHolidaysForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:197
* @route '/hris/schedules/shifts'
*/
export const storeShift = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeShift.url(options),
    method: 'post',
})

storeShift.definition = {
    methods: ["post"],
    url: '/hris/schedules/shifts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:197
* @route '/hris/schedules/shifts'
*/
storeShift.url = (options?: RouteQueryOptions) => {
    return storeShift.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:197
* @route '/hris/schedules/shifts'
*/
storeShift.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeShift.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:197
* @route '/hris/schedules/shifts'
*/
const storeShiftForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeShift.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:197
* @route '/hris/schedules/shifts'
*/
storeShiftForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeShift.url(options),
    method: 'post',
})

storeShift.form = storeShiftForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:227
* @route '/hris/schedules/shifts/{workShift}'
*/
export const updateShift = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateShift.url(args, options),
    method: 'put',
})

updateShift.definition = {
    methods: ["put"],
    url: '/hris/schedules/shifts/{workShift}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:227
* @route '/hris/schedules/shifts/{workShift}'
*/
updateShift.url = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workShift: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { workShift: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            workShift: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        workShift: typeof args.workShift === 'object'
        ? args.workShift.id
        : args.workShift,
    }

    return updateShift.definition.url
            .replace('{workShift}', parsedArgs.workShift.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:227
* @route '/hris/schedules/shifts/{workShift}'
*/
updateShift.put = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateShift.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:227
* @route '/hris/schedules/shifts/{workShift}'
*/
const updateShiftForm = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateShift.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:227
* @route '/hris/schedules/shifts/{workShift}'
*/
updateShiftForm.put = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateShift.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateShift.form = updateShiftForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:249
* @route '/hris/schedules/shifts/{workShift}'
*/
export const destroyShift = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyShift.url(args, options),
    method: 'delete',
})

destroyShift.definition = {
    methods: ["delete"],
    url: '/hris/schedules/shifts/{workShift}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:249
* @route '/hris/schedules/shifts/{workShift}'
*/
destroyShift.url = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workShift: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { workShift: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            workShift: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        workShift: typeof args.workShift === 'object'
        ? args.workShift.id
        : args.workShift,
    }

    return destroyShift.definition.url
            .replace('{workShift}', parsedArgs.workShift.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:249
* @route '/hris/schedules/shifts/{workShift}'
*/
destroyShift.delete = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyShift.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:249
* @route '/hris/schedules/shifts/{workShift}'
*/
const destroyShiftForm = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyShift.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:249
* @route '/hris/schedules/shifts/{workShift}'
*/
destroyShiftForm.delete = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyShift.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyShift.form = destroyShiftForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:116
* @route '/hris/schedules/roster'
*/
export const roster = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: roster.url(options),
    method: 'post',
})

roster.definition = {
    methods: ["post"],
    url: '/hris/schedules/roster',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:116
* @route '/hris/schedules/roster'
*/
roster.url = (options?: RouteQueryOptions) => {
    return roster.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:116
* @route '/hris/schedules/roster'
*/
roster.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: roster.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:116
* @route '/hris/schedules/roster'
*/
const rosterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: roster.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:116
* @route '/hris/schedules/roster'
*/
rosterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: roster.url(options),
    method: 'post',
})

roster.form = rosterForm

const ScheduleController = { index, store, destroySchedule, syncHolidays, storeShift, updateShift, destroyShift, roster }

export default ScheduleController