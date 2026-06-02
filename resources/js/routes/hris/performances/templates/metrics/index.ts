import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
export const store = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/performances/templates/{template}/metrics',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
store.url = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return store.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
store.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
const storeForm = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::store
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
storeForm.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const metrics = {
    store: Object.assign(store, store),
}

export default metrics