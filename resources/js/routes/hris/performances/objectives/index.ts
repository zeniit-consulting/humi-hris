import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
import keyResults from './key-results'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
export const update = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/performances/objectives/{objective}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
update.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
update.put = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
const updateForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
updateForm.put = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
export const destroy = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/performances/objectives/{objective}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroy.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroy.delete = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
const destroyForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroyForm.delete = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const objectives = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    keyResults: Object.assign(keyResults, keyResults),
}

export default objectives