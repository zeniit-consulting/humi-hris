import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/reimbursements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::index
* @see app/Http/Controllers/Api/PortalReimbursementController.php:17
* @route '/portal/api/reimbursements'
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
* @see \App\Http\Controllers\Api\PortalReimbursementController::store
* @see app/Http/Controllers/Api/PortalReimbursementController.php:25
* @route '/portal/api/reimbursements'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/reimbursements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::store
* @see app/Http/Controllers/Api/PortalReimbursementController.php:25
* @route '/portal/api/reimbursements'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::store
* @see app/Http/Controllers/Api/PortalReimbursementController.php:25
* @route '/portal/api/reimbursements'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::store
* @see app/Http/Controllers/Api/PortalReimbursementController.php:25
* @route '/portal/api/reimbursements'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalReimbursementController::store
* @see app/Http/Controllers/Api/PortalReimbursementController.php:25
* @route '/portal/api/reimbursements'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PortalReimbursementController = { index, store }

export default PortalReimbursementController