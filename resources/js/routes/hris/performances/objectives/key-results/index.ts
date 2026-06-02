import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
export const store = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/performances/objectives/{objective}/key-results',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
store.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { objective: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { objective: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            objective: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        objective: typeof args.objective === 'object'
        ? args.objective.id
        : args.objective,
    }

    return store.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
store.post = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
const storeForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
storeForm.post = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const keyResults = {
    store: Object.assign(store, store),
}

export default keyResults