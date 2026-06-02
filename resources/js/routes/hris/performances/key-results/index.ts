import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
export const update = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/performances/key-results/{keyResult}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
update.url = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { keyResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { keyResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            keyResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        keyResult: typeof args.keyResult === 'object'
        ? args.keyResult.id
        : args.keyResult,
    }

    return update.definition.url
            .replace('{keyResult}', parsedArgs.keyResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
update.put = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::update
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
const updateForm = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
updateForm.put = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
export const destroy = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/performances/key-results/{keyResult}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroy.url = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { keyResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { keyResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            keyResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        keyResult: typeof args.keyResult === 'object'
        ? args.keyResult.id
        : args.keyResult,
    }

    return destroy.definition.url
            .replace('{keyResult}', parsedArgs.keyResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroy.delete = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroy
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
const destroyForm = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroyForm.delete = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const keyResults = {
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default keyResults