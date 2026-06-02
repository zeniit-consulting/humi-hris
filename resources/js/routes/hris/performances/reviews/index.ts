import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
import objectives from './objectives'
import checkIns from './check-ins'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
export const update = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/performances/reviews/{review}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
update.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return update.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
update.put = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
const updateForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
updateForm.put = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
export const syncAttendance = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncAttendance.url(args, options),
    method: 'post',
})

syncAttendance.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews/{review}/sync-attendance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendance.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return syncAttendance.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendance.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
const syncAttendanceForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendanceForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncAttendance.url(args, options),
    method: 'post',
})

syncAttendance.form = syncAttendanceForm

const reviews = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    syncAttendance: Object.assign(syncAttendance, syncAttendance),
    objectives: Object.assign(objectives, objectives),
    checkIns: Object.assign(checkIns, checkIns),
}

export default reviews