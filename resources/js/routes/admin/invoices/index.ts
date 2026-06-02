import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/invoices',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:168
* @route '/admin/invoices'
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

const invoices = {
    index: Object.assign(index, index),
}

export default invoices