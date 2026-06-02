import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
export const update = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/performances/metrics/{metric}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
update.url = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metric: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { metric: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            metric: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        metric: typeof args.metric === 'object'
        ? args.metric.id
        : args.metric,
    }

    return update.definition.url
            .replace('{metric}', parsedArgs.metric.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
update.put = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
const updateForm = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
updateForm.put = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
export const destroy = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/performances/metrics/{metric}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroy.url = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metric: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { metric: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            metric: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        metric: typeof args.metric === 'object'
        ? args.metric.id
        : args.metric,
    }

    return destroy.definition.url
            .replace('{metric}', parsedArgs.metric.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroy.delete = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
const destroyForm = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroyForm.delete = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const metrics = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default metrics