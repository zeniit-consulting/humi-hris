import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:328
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
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
sync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::sync
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
syncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url(options),
    method: 'post',
})

sync.form = syncForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
export const check = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(options),
    method: 'get',
})

check.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/check',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
check.url = (options?: RouteQueryOptions) => {
    return check.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
check.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
check.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: check.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
const checkForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::check
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: check.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

check.form = checkForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
export const latest = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: latest.url(options),
    method: 'get',
})

latest.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/latest',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latest.url = (options?: RouteQueryOptions) => {
    return latest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latest.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: latest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latest.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: latest.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
const latestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latest
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latest.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

latest.form = latestForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
export const year = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: year.url(args, options),
    method: 'get',
})

year.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/{year}/year',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
year.url = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { year: args }
    }

    if (Array.isArray(args)) {
        args = {
            year: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        year: args.year,
    }

    return year.definition.url
            .replace('{year}', parsedArgs.year.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
year.get = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: year.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
year.head = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: year.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
const yearForm = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: year.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearForm.get = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: year.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::year
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearForm.head = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: year.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

year.form = yearForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:493
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
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:571
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
* @see app/Http/Controllers/Hris/ScheduleController.php:571
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
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroy.delete = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:571
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
* @see app/Http/Controllers/Hris/ScheduleController.php:571
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
    check: Object.assign(check, check),
    latest: Object.assign(latest, latest),
    year: Object.assign(year, year),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default holidays