import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:320
* @route '/hris/schedules/holidays/sync'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

sync.definition = {
    methods: ["post"],
    url: '/hris/schedules/holidays/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:320
* @route '/hris/schedules/holidays/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:320
* @route '/hris/schedules/holidays/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:320
* @route '/hris/schedules/holidays/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:320
* @route '/hris/schedules/holidays/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:414
* @route '/hris/schedules/holidays'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/schedules/holidays',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:414
* @route '/hris/schedules/holidays'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:414
* @route '/hris/schedules/holidays'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:414
* @route '/hris/schedules/holidays'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:414
* @route '/hris/schedules/holidays'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:492
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
export const destroy = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/schedules/holidays/{publicHoliday}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:492
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroy.url = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { publicHoliday: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { publicHoliday: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            publicHoliday: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        publicHoliday: typeof args.publicHoliday === 'object'
        ? args.publicHoliday.id
        : args.publicHoliday,
    }

    return destroy.definition.url
            .replace('{publicHoliday}', parsedArgs.publicHoliday.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:492
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroy.delete = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:492
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
const destroyForm = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/ScheduleController.php:492
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroyForm.delete = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const holidays = {
    sync: Object.assign(sync, sync),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default holidays