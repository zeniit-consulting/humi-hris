import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:277
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
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:277
* @route '/hris/schedules/holidays/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

const holidays = {
    sync: Object.assign(sync, sync),
}

export default holidays