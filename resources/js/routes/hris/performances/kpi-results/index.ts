import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:424
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
export const update = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/performances/kpi-results/{kpiResult}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:424
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
update.url = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { kpiResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { kpiResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            kpiResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        kpiResult: typeof args.kpiResult === 'object'
        ? args.kpiResult.id
        : args.kpiResult,
    }

    return update.definition.url
            .replace('{kpiResult}', parsedArgs.kpiResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:424
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
update.put = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:424
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
const updateForm = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:424
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
updateForm.put = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const kpiResults = {
    update: Object.assign(update, update),
}

export default kpiResults