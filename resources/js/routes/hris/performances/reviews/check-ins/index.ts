import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
export const store = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews/{review}/check-ins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
store.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
store.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
const storeForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
storeForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const checkIns = {
    store: Object.assign(store, store),
}

export default checkIns