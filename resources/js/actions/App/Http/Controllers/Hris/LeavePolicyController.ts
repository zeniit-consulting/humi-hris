import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::store
* @see app/Http/Controllers/Hris/LeavePolicyController.php:16
* @route '/hris/leaves/policy'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/leaves/policy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::store
* @see app/Http/Controllers/Hris/LeavePolicyController.php:16
* @route '/hris/leaves/policy'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::store
* @see app/Http/Controllers/Hris/LeavePolicyController.php:16
* @route '/hris/leaves/policy'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::store
* @see app/Http/Controllers/Hris/LeavePolicyController.php:16
* @route '/hris/leaves/policy'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::store
* @see app/Http/Controllers/Hris/LeavePolicyController.php:16
* @route '/hris/leaves/policy'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::update
* @see app/Http/Controllers/Hris/LeavePolicyController.php:44
* @route '/hris/leaves/policy/{policy}'
*/
export const update = (args: { policy: number | { id: number } } | [policy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/leaves/policy/{policy}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::update
* @see app/Http/Controllers/Hris/LeavePolicyController.php:44
* @route '/hris/leaves/policy/{policy}'
*/
update.url = (args: { policy: number | { id: number } } | [policy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { policy: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { policy: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            policy: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        policy: typeof args.policy === 'object'
        ? args.policy.id
        : args.policy,
    }

    return update.definition.url
            .replace('{policy}', parsedArgs.policy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::update
* @see app/Http/Controllers/Hris/LeavePolicyController.php:44
* @route '/hris/leaves/policy/{policy}'
*/
update.put = (args: { policy: number | { id: number } } | [policy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::update
* @see app/Http/Controllers/Hris/LeavePolicyController.php:44
* @route '/hris/leaves/policy/{policy}'
*/
const updateForm = (args: { policy: number | { id: number } } | [policy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeavePolicyController::update
* @see app/Http/Controllers/Hris/LeavePolicyController.php:44
* @route '/hris/leaves/policy/{policy}'
*/
updateForm.put = (args: { policy: number | { id: number } } | [policy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const LeavePolicyController = { store, update }

export default LeavePolicyController