import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\DivisionController::store
* @see app/Http/Controllers/Hris/DivisionController.php:17
* @route '/hris/divisions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/divisions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\DivisionController::store
* @see app/Http/Controllers/Hris/DivisionController.php:17
* @route '/hris/divisions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\DivisionController::store
* @see app/Http/Controllers/Hris/DivisionController.php:17
* @route '/hris/divisions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::store
* @see app/Http/Controllers/Hris/DivisionController.php:17
* @route '/hris/divisions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::store
* @see app/Http/Controllers/Hris/DivisionController.php:17
* @route '/hris/divisions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\DivisionController::update
* @see app/Http/Controllers/Hris/DivisionController.php:30
* @route '/hris/divisions/{division}'
*/
export const update = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/divisions/{division}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\DivisionController::update
* @see app/Http/Controllers/Hris/DivisionController.php:30
* @route '/hris/divisions/{division}'
*/
update.url = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { division: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            division: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        division: typeof args.division === 'object'
        ? args.division.id
        : args.division,
    }

    return update.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\DivisionController::update
* @see app/Http/Controllers/Hris/DivisionController.php:30
* @route '/hris/divisions/{division}'
*/
update.put = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::update
* @see app/Http/Controllers/Hris/DivisionController.php:30
* @route '/hris/divisions/{division}'
*/
const updateForm = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::update
* @see app/Http/Controllers/Hris/DivisionController.php:30
* @route '/hris/divisions/{division}'
*/
updateForm.put = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\DivisionController::destroy
* @see app/Http/Controllers/Hris/DivisionController.php:43
* @route '/hris/divisions/{division}'
*/
export const destroy = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/divisions/{division}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\DivisionController::destroy
* @see app/Http/Controllers/Hris/DivisionController.php:43
* @route '/hris/divisions/{division}'
*/
destroy.url = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { division: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { division: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            division: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        division: typeof args.division === 'object'
        ? args.division.id
        : args.division,
    }

    return destroy.definition.url
            .replace('{division}', parsedArgs.division.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\DivisionController::destroy
* @see app/Http/Controllers/Hris/DivisionController.php:43
* @route '/hris/divisions/{division}'
*/
destroy.delete = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::destroy
* @see app/Http/Controllers/Hris/DivisionController.php:43
* @route '/hris/divisions/{division}'
*/
const destroyForm = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\DivisionController::destroy
* @see app/Http/Controllers/Hris/DivisionController.php:43
* @route '/hris/divisions/{division}'
*/
destroyForm.delete = (args: { division: number | { id: number } } | [division: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const divisions = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default divisions