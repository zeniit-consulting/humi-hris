import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PositionController::store
* @see app/Http/Controllers/Hris/PositionController.php:17
* @route '/hris/positions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/positions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PositionController::store
* @see app/Http/Controllers/Hris/PositionController.php:17
* @route '/hris/positions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PositionController::store
* @see app/Http/Controllers/Hris/PositionController.php:17
* @route '/hris/positions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::store
* @see app/Http/Controllers/Hris/PositionController.php:17
* @route '/hris/positions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::store
* @see app/Http/Controllers/Hris/PositionController.php:17
* @route '/hris/positions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\PositionController::update
* @see app/Http/Controllers/Hris/PositionController.php:34
* @route '/hris/positions/{position}'
*/
export const update = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/positions/{position}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PositionController::update
* @see app/Http/Controllers/Hris/PositionController.php:34
* @route '/hris/positions/{position}'
*/
update.url = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { position: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { position: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            position: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        position: typeof args.position === 'object'
        ? args.position.id
        : args.position,
    }

    return update.definition.url
            .replace('{position}', parsedArgs.position.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PositionController::update
* @see app/Http/Controllers/Hris/PositionController.php:34
* @route '/hris/positions/{position}'
*/
update.put = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::update
* @see app/Http/Controllers/Hris/PositionController.php:34
* @route '/hris/positions/{position}'
*/
const updateForm = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::update
* @see app/Http/Controllers/Hris/PositionController.php:34
* @route '/hris/positions/{position}'
*/
updateForm.put = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\PositionController::destroy
* @see app/Http/Controllers/Hris/PositionController.php:51
* @route '/hris/positions/{position}'
*/
export const destroy = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/positions/{position}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PositionController::destroy
* @see app/Http/Controllers/Hris/PositionController.php:51
* @route '/hris/positions/{position}'
*/
destroy.url = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { position: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { position: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            position: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        position: typeof args.position === 'object'
        ? args.position.id
        : args.position,
    }

    return destroy.definition.url
            .replace('{position}', parsedArgs.position.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PositionController::destroy
* @see app/Http/Controllers/Hris/PositionController.php:51
* @route '/hris/positions/{position}'
*/
destroy.delete = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::destroy
* @see app/Http/Controllers/Hris/PositionController.php:51
* @route '/hris/positions/{position}'
*/
const destroyForm = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PositionController::destroy
* @see app/Http/Controllers/Hris/PositionController.php:51
* @route '/hris/positions/{position}'
*/
destroyForm.delete = (args: { position: number | { id: number } } | [position: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const PositionController = { store, update, destroy }

export default PositionController