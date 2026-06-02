import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/client-billings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::index
* @see app/Http/Controllers/Hris/ClientBillingController.php:20
* @route '/hris/client-billings'
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
* @see \App\Http\Controllers\Hris\ClientBillingController::store
* @see app/Http/Controllers/Hris/ClientBillingController.php:84
* @route '/hris/client-billings'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/client-billings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::store
* @see app/Http/Controllers/Hris/ClientBillingController.php:84
* @route '/hris/client-billings'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::store
* @see app/Http/Controllers/Hris/ClientBillingController.php:84
* @route '/hris/client-billings'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::store
* @see app/Http/Controllers/Hris/ClientBillingController.php:84
* @route '/hris/client-billings'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::store
* @see app/Http/Controllers/Hris/ClientBillingController.php:84
* @route '/hris/client-billings'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::update
* @see app/Http/Controllers/Hris/ClientBillingController.php:133
* @route '/hris/client-billings/{clientInvoice}'
*/
export const update = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/client-billings/{clientInvoice}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::update
* @see app/Http/Controllers/Hris/ClientBillingController.php:133
* @route '/hris/client-billings/{clientInvoice}'
*/
update.url = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { clientInvoice: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { clientInvoice: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            clientInvoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        clientInvoice: typeof args.clientInvoice === 'object'
        ? args.clientInvoice.id
        : args.clientInvoice,
    }

    return update.definition.url
            .replace('{clientInvoice}', parsedArgs.clientInvoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::update
* @see app/Http/Controllers/Hris/ClientBillingController.php:133
* @route '/hris/client-billings/{clientInvoice}'
*/
update.put = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::update
* @see app/Http/Controllers/Hris/ClientBillingController.php:133
* @route '/hris/client-billings/{clientInvoice}'
*/
const updateForm = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::update
* @see app/Http/Controllers/Hris/ClientBillingController.php:133
* @route '/hris/client-billings/{clientInvoice}'
*/
updateForm.put = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\ClientBillingController::destroy
* @see app/Http/Controllers/Hris/ClientBillingController.php:148
* @route '/hris/client-billings/{clientInvoice}'
*/
export const destroy = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/client-billings/{clientInvoice}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::destroy
* @see app/Http/Controllers/Hris/ClientBillingController.php:148
* @route '/hris/client-billings/{clientInvoice}'
*/
destroy.url = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { clientInvoice: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { clientInvoice: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            clientInvoice: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        clientInvoice: typeof args.clientInvoice === 'object'
        ? args.clientInvoice.id
        : args.clientInvoice,
    }

    return destroy.definition.url
            .replace('{clientInvoice}', parsedArgs.clientInvoice.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::destroy
* @see app/Http/Controllers/Hris/ClientBillingController.php:148
* @route '/hris/client-billings/{clientInvoice}'
*/
destroy.delete = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::destroy
* @see app/Http/Controllers/Hris/ClientBillingController.php:148
* @route '/hris/client-billings/{clientInvoice}'
*/
const destroyForm = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ClientBillingController::destroy
* @see app/Http/Controllers/Hris/ClientBillingController.php:148
* @route '/hris/client-billings/{clientInvoice}'
*/
destroyForm.delete = (args: { clientInvoice: number | { id: number } } | [clientInvoice: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const clientBillings = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default clientBillings