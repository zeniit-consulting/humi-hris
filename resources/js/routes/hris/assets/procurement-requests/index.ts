import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/assets/procurement-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::index
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:18
* @route '/hris/assets/procurement-requests'
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
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::store
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:85
* @route '/hris/assets/procurement-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/assets/procurement-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::store
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:85
* @route '/hris/assets/procurement-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::store
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:85
* @route '/hris/assets/procurement-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::store
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:85
* @route '/hris/assets/procurement-requests'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::store
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:85
* @route '/hris/assets/procurement-requests'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::status
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:100
* @route '/hris/assets/procurement-requests/{procurementRequest}/status'
*/
export const status = (args: { procurementRequest: number | { id: number } } | [procurementRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/hris/assets/procurement-requests/{procurementRequest}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::status
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:100
* @route '/hris/assets/procurement-requests/{procurementRequest}/status'
*/
status.url = (args: { procurementRequest: number | { id: number } } | [procurementRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { procurementRequest: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { procurementRequest: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            procurementRequest: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        procurementRequest: typeof args.procurementRequest === 'object'
        ? args.procurementRequest.id
        : args.procurementRequest,
    }

    return status.definition.url
            .replace('{procurementRequest}', parsedArgs.procurementRequest.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::status
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:100
* @route '/hris/assets/procurement-requests/{procurementRequest}/status'
*/
status.post = (args: { procurementRequest: number | { id: number } } | [procurementRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::status
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:100
* @route '/hris/assets/procurement-requests/{procurementRequest}/status'
*/
const statusForm = (args: { procurementRequest: number | { id: number } } | [procurementRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: status.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetProcurementRequestController::status
* @see app/Http/Controllers/Hris/CompanyAssetProcurementRequestController.php:100
* @route '/hris/assets/procurement-requests/{procurementRequest}/status'
*/
statusForm.post = (args: { procurementRequest: number | { id: number } } | [procurementRequest: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: status.url(args, options),
    method: 'post',
})

status.form = statusForm

const procurementRequests = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    status: Object.assign(status, status),
}

export default procurementRequests