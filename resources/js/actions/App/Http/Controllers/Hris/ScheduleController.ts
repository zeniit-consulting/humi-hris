import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
const checkHoliday245fd003efbfd531dd139f3e08cdab23 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkHoliday245fd003efbfd531dd139f3e08cdab23.url(options),
    method: 'get',
})

checkHoliday245fd003efbfd531dd139f3e08cdab23.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/is-holiday',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
checkHoliday245fd003efbfd531dd139f3e08cdab23.url = (options?: RouteQueryOptions) => {
    return checkHoliday245fd003efbfd531dd139f3e08cdab23.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
checkHoliday245fd003efbfd531dd139f3e08cdab23.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkHoliday245fd003efbfd531dd139f3e08cdab23.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
checkHoliday245fd003efbfd531dd139f3e08cdab23.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkHoliday245fd003efbfd531dd139f3e08cdab23.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
const checkHoliday245fd003efbfd531dd139f3e08cdab23Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHoliday245fd003efbfd531dd139f3e08cdab23.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
checkHoliday245fd003efbfd531dd139f3e08cdab23Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHoliday245fd003efbfd531dd139f3e08cdab23.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/api/mobile/v1/portal/is-holiday'
*/
checkHoliday245fd003efbfd531dd139f3e08cdab23Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHoliday245fd003efbfd531dd139f3e08cdab23.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkHoliday245fd003efbfd531dd139f3e08cdab23.form = checkHoliday245fd003efbfd531dd139f3e08cdab23Form
/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
const checkHolidayb1641a2a95866f12bbe638e48a6ba84d = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url(options),
    method: 'get',
})

checkHolidayb1641a2a95866f12bbe638e48a6ba84d.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/check',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url = (options?: RouteQueryOptions) => {
    return checkHolidayb1641a2a95866f12bbe638e48a6ba84d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkHolidayb1641a2a95866f12bbe638e48a6ba84d.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkHolidayb1641a2a95866f12bbe638e48a6ba84d.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
const checkHolidayb1641a2a95866f12bbe638e48a6ba84dForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkHolidayb1641a2a95866f12bbe638e48a6ba84dForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::checkHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:427
* @route '/hris/schedules/holidays/check'
*/
checkHolidayb1641a2a95866f12bbe638e48a6ba84dForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkHolidayb1641a2a95866f12bbe638e48a6ba84d.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkHolidayb1641a2a95866f12bbe638e48a6ba84d.form = checkHolidayb1641a2a95866f12bbe638e48a6ba84dForm

export const checkHoliday = {
    '/api/mobile/v1/portal/is-holiday': checkHoliday245fd003efbfd531dd139f3e08cdab23,
    '/hris/schedules/holidays/check': checkHolidayb1641a2a95866f12bbe638e48a6ba84d,
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
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
* @see app/Http/Controllers/Hris/ScheduleController.php:40
* @route '/hris/schedules'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
* @route '/hris/schedules'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
* @route '/hris/schedules'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
* @route '/hris/schedules'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
* @route '/hris/schedules'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::index
* @see app/Http/Controllers/Hris/ScheduleController.php:40
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
* @see app/Http/Controllers/Hris/ScheduleController.php:87
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
* @see app/Http/Controllers/Hris/ScheduleController.php:87
* @route '/hris/schedules'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:87
* @route '/hris/schedules'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:87
* @route '/hris/schedules'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:87
* @route '/hris/schedules'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:318
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
* @see app/Http/Controllers/Hris/ScheduleController.php:318
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
* @see app/Http/Controllers/Hris/ScheduleController.php:318
* @route '/hris/schedules/{employeeSchedule}'
*/
destroySchedule.delete = (args: { employeeSchedule: number | { id: number } } | [employeeSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroySchedule.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroySchedule
* @see app/Http/Controllers/Hris/ScheduleController.php:318
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
* @see app/Http/Controllers/Hris/ScheduleController.php:318
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
* @see app/Http/Controllers/Hris/ScheduleController.php:328
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
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
syncHolidays.url = (options?: RouteQueryOptions) => {
    return syncHolidays.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
syncHolidays.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncHolidays.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
const syncHolidaysForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncHolidays.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::syncHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:328
* @route '/hris/schedules/holidays/sync'
*/
syncHolidaysForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncHolidays.url(options),
    method: 'post',
})

syncHolidays.form = syncHolidaysForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
export const latestHolidays = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: latestHolidays.url(options),
    method: 'get',
})

latestHolidays.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/latest',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestHolidays.url = (options?: RouteQueryOptions) => {
    return latestHolidays.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestHolidays.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: latestHolidays.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestHolidays.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: latestHolidays.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
const latestHolidaysForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latestHolidays.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestHolidaysForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latestHolidays.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::latestHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:462
* @route '/hris/schedules/holidays/latest'
*/
latestHolidaysForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: latestHolidays.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

latestHolidays.form = latestHolidaysForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
export const yearHolidays = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: yearHolidays.url(args, options),
    method: 'get',
})

yearHolidays.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/holidays/{year}/year',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearHolidays.url = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return yearHolidays.definition.url
            .replace('{year}', parsedArgs.year.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearHolidays.get = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: yearHolidays.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearHolidays.head = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: yearHolidays.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
const yearHolidaysForm = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: yearHolidays.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearHolidaysForm.get = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: yearHolidays.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::yearHolidays
* @see app/Http/Controllers/Hris/ScheduleController.php:476
* @route '/hris/schedules/holidays/{year}/year'
*/
yearHolidaysForm.head = (args: { year: string | number } | [year: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: yearHolidays.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

yearHolidays.form = yearHolidaysForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
export const storeHoliday = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeHoliday.url(options),
    method: 'post',
})

storeHoliday.definition = {
    methods: ["post"],
    url: '/hris/schedules/holidays',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
storeHoliday.url = (options?: RouteQueryOptions) => {
    return storeHoliday.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
storeHoliday.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeHoliday.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
const storeHolidayForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeHoliday.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:493
* @route '/hris/schedules/holidays'
*/
storeHolidayForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeHoliday.url(options),
    method: 'post',
})

storeHoliday.form = storeHolidayForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
export const destroyHoliday = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHoliday.url(args, options),
    method: 'delete',
})

destroyHoliday.definition = {
    methods: ["delete"],
    url: '/hris/schedules/holidays/{publicHoliday}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroyHoliday.url = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroyHoliday.definition.url
            .replace('{publicHoliday}', parsedArgs.publicHoliday.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroyHoliday.delete = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyHoliday.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
const destroyHolidayForm = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyHoliday.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyHoliday
* @see app/Http/Controllers/Hris/ScheduleController.php:571
* @route '/hris/schedules/holidays/{publicHoliday}'
*/
destroyHolidayForm.delete = (args: { publicHoliday: number | { id: number } } | [publicHoliday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyHoliday.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyHoliday.form = destroyHolidayForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:244
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
* @see app/Http/Controllers/Hris/ScheduleController.php:244
* @route '/hris/schedules/shifts'
*/
storeShift.url = (options?: RouteQueryOptions) => {
    return storeShift.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:244
* @route '/hris/schedules/shifts'
*/
storeShift.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeShift.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:244
* @route '/hris/schedules/shifts'
*/
const storeShiftForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeShift.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::storeShift
* @see app/Http/Controllers/Hris/ScheduleController.php:244
* @route '/hris/schedules/shifts'
*/
storeShiftForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeShift.url(options),
    method: 'post',
})

storeShift.form = storeShiftForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:276
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
* @see app/Http/Controllers/Hris/ScheduleController.php:276
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
* @see app/Http/Controllers/Hris/ScheduleController.php:276
* @route '/hris/schedules/shifts/{workShift}'
*/
updateShift.put = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateShift.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::updateShift
* @see app/Http/Controllers/Hris/ScheduleController.php:276
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
* @see app/Http/Controllers/Hris/ScheduleController.php:276
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
* @see app/Http/Controllers/Hris/ScheduleController.php:300
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
* @see app/Http/Controllers/Hris/ScheduleController.php:300
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
* @see app/Http/Controllers/Hris/ScheduleController.php:300
* @route '/hris/schedules/shifts/{workShift}'
*/
destroyShift.delete = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyShift.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroyShift
* @see app/Http/Controllers/Hris/ScheduleController.php:300
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
* @see app/Http/Controllers/Hris/ScheduleController.php:300
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
* @see app/Http/Controllers/Hris/ScheduleController.php:136
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
* @see app/Http/Controllers/Hris/ScheduleController.php:136
* @route '/hris/schedules/roster'
*/
roster.url = (options?: RouteQueryOptions) => {
    return roster.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:136
* @route '/hris/schedules/roster'
*/
roster.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: roster.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:136
* @route '/hris/schedules/roster'
*/
const rosterForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: roster.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::roster
* @see app/Http/Controllers/Hris/ScheduleController.php:136
* @route '/hris/schedules/roster'
*/
rosterForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: roster.url(options),
    method: 'post',
})

roster.form = rosterForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
export const importTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

importTemplate.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/import/template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
importTemplate.url = (options?: RouteQueryOptions) => {
    return importTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
importTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
importTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: importTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
const importTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
importTemplateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importTemplate
* @see app/Http/Controllers/Hris/ScheduleController.php:741
* @route '/hris/schedules/import/template'
*/
importTemplateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

importTemplate.form = importTemplateForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importMethod
* @see app/Http/Controllers/Hris/ScheduleController.php:913
* @route '/hris/schedules/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/hris/schedules/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importMethod
* @see app/Http/Controllers/Hris/ScheduleController.php:913
* @route '/hris/schedules/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importMethod
* @see app/Http/Controllers/Hris/ScheduleController.php:913
* @route '/hris/schedules/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importMethod
* @see app/Http/Controllers/Hris/ScheduleController.php:913
* @route '/hris/schedules/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::importMethod
* @see app/Http/Controllers/Hris/ScheduleController.php:913
* @route '/hris/schedules/import'
*/
importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

importMethod.form = importMethodForm

const ScheduleController = { checkHoliday, index, store, destroySchedule, syncHolidays, latestHolidays, yearHolidays, storeHoliday, destroyHoliday, storeShift, updateShift, destroyShift, roster, importTemplate, importMethod, import: importMethod }

export default ScheduleController