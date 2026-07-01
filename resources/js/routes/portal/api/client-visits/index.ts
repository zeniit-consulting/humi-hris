import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/client-visits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::index
* @see app/Http/Controllers/Api/PortalClientVisitController.php:18
* @route '/portal/api/client-visits'
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
* @see \App\Http\Controllers\Api\PortalClientVisitController::store
* @see app/Http/Controllers/Api/PortalClientVisitController.php:43
* @route '/portal/api/client-visits'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/client-visits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::store
* @see app/Http/Controllers/Api/PortalClientVisitController.php:43
* @route '/portal/api/client-visits'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::store
* @see app/Http/Controllers/Api/PortalClientVisitController.php:43
* @route '/portal/api/client-visits'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::store
* @see app/Http/Controllers/Api/PortalClientVisitController.php:43
* @route '/portal/api/client-visits'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::store
* @see app/Http/Controllers/Api/PortalClientVisitController.php:43
* @route '/portal/api/client-visits'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::clockOut
* @see app/Http/Controllers/Api/PortalClientVisitController.php:77
* @route '/portal/api/client-visits/{visit}/clock-out'
*/
export const clockOut = (args: { visit: number | { id: number } } | [visit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: clockOut.url(args, options),
    method: 'put',
})

clockOut.definition = {
    methods: ["put"],
    url: '/portal/api/client-visits/{visit}/clock-out',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::clockOut
* @see app/Http/Controllers/Api/PortalClientVisitController.php:77
* @route '/portal/api/client-visits/{visit}/clock-out'
*/
clockOut.url = (args: { visit: number | { id: number } } | [visit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { visit: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { visit: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            visit: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        visit: typeof args.visit === 'object'
        ? args.visit.id
        : args.visit,
    }

    return clockOut.definition.url
            .replace('{visit}', parsedArgs.visit.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::clockOut
* @see app/Http/Controllers/Api/PortalClientVisitController.php:77
* @route '/portal/api/client-visits/{visit}/clock-out'
*/
clockOut.put = (args: { visit: number | { id: number } } | [visit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: clockOut.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::clockOut
* @see app/Http/Controllers/Api/PortalClientVisitController.php:77
* @route '/portal/api/client-visits/{visit}/clock-out'
*/
const clockOutForm = (args: { visit: number | { id: number } } | [visit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: clockOut.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalClientVisitController::clockOut
* @see app/Http/Controllers/Api/PortalClientVisitController.php:77
* @route '/portal/api/client-visits/{visit}/clock-out'
*/
clockOutForm.put = (args: { visit: number | { id: number } } | [visit: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: clockOut.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

clockOut.form = clockOutForm

const clientVisits = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    clockOut: Object.assign(clockOut, clockOut),
}

export default clientVisits