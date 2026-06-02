import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import policy from './policy'
import balances from './balances'
/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/leaves',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::index
* @see app/Http/Controllers/Hris/LeaveController.php:26
* @route '/hris/leaves'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/hris/leaves/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::exportMethod
* @see app/Http/Controllers/Hris/LeaveController.php:355
* @route '/hris/leaves/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::store
* @see app/Http/Controllers/Hris/LeaveController.php:226
* @route '/hris/leaves'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/leaves',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::store
* @see app/Http/Controllers/Hris/LeaveController.php:226
* @route '/hris/leaves'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::store
* @see app/Http/Controllers/Hris/LeaveController.php:226
* @route '/hris/leaves'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::store
* @see app/Http/Controllers/Hris/LeaveController.php:226
* @route '/hris/leaves'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::store
* @see app/Http/Controllers/Hris/LeaveController.php:226
* @route '/hris/leaves'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\LeaveController::update
* @see app/Http/Controllers/Hris/LeaveController.php:277
* @route '/hris/leaves/{leave}'
*/
export const update = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/leaves/{leave}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::update
* @see app/Http/Controllers/Hris/LeaveController.php:277
* @route '/hris/leaves/{leave}'
*/
update.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return update.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::update
* @see app/Http/Controllers/Hris/LeaveController.php:277
* @route '/hris/leaves/{leave}'
*/
update.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::update
* @see app/Http/Controllers/Hris/LeaveController.php:277
* @route '/hris/leaves/{leave}'
*/
const updateForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::update
* @see app/Http/Controllers/Hris/LeaveController.php:277
* @route '/hris/leaves/{leave}'
*/
updateForm.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\LeaveController::destroy
* @see app/Http/Controllers/Hris/LeaveController.php:345
* @route '/hris/leaves/{leave}'
*/
export const destroy = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/leaves/{leave}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\LeaveController::destroy
* @see app/Http/Controllers/Hris/LeaveController.php:345
* @route '/hris/leaves/{leave}'
*/
destroy.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return destroy.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveController::destroy
* @see app/Http/Controllers/Hris/LeaveController.php:345
* @route '/hris/leaves/{leave}'
*/
destroy.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::destroy
* @see app/Http/Controllers/Hris/LeaveController.php:345
* @route '/hris/leaves/{leave}'
*/
const destroyForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveController::destroy
* @see app/Http/Controllers/Hris/LeaveController.php:345
* @route '/hris/leaves/{leave}'
*/
destroyForm.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const leaves = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
    policy: Object.assign(policy, policy),
    balances: Object.assign(balances, balances),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default leaves