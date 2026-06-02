import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import holidays from './holidays'
import shifts from './shifts'
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
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:233
* @route '/hris/schedules/{employeeSchedule}'
*/
export const destroy = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/schedules/{employeeSchedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:233
* @route '/hris/schedules/{employeeSchedule}'
*/
destroy.url = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{employeeSchedule}', parsedArgs.employeeSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:233
* @route '/hris/schedules/{employeeSchedule}'
*/
destroy.delete = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:233
* @route '/hris/schedules/{employeeSchedule}'
*/
const destroyForm = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:233
* @route '/hris/schedules/{employeeSchedule}'
*/
destroyForm.delete = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

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

const schedules = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
    holidays: Object.assign(holidays, holidays),
    shifts: Object.assign(shifts, shifts),
    roster: Object.assign(roster, roster),
}

export default schedules