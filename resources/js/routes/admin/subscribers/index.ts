import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import subscription from './subscription'
import invoices from './invoices'
/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/subscribers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::index
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:27
* @route '/admin/subscribers'
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
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
export const suspend = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

suspend.definition = {
    methods: ["post"],
    url: '/admin/subscribers/{subscriber}/suspend',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspend.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriber: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscriber: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscriber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscriber: typeof args.subscriber === 'object'
        ? args.subscriber.id
        : args.subscriber,
    }

    return suspend.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspend.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: suspend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
const suspendForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suspend.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::suspend
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:398
* @route '/admin/subscribers/{subscriber}/suspend'
*/
suspendForm.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: suspend.url(args, options),
    method: 'post',
})

suspend.form = suspendForm

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
export const reactivate = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

reactivate.definition = {
    methods: ["post"],
    url: '/admin/subscribers/{subscriber}/reactivate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivate.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subscriber: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subscriber: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subscriber: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subscriber: typeof args.subscriber === 'object'
        ? args.subscriber.id
        : args.subscriber,
    }

    return reactivate.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivate.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
const reactivateForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reactivate.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::reactivate
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:426
* @route '/admin/subscribers/{subscriber}/reactivate'
*/
reactivateForm.post = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reactivate.url(args, options),
    method: 'post',
})

reactivate.form = reactivateForm

const subscribers = {
    index: Object.assign(index, index),
    subscription: Object.assign(subscription, subscription),
    suspend: Object.assign(suspend, suspend),
    reactivate: Object.assign(reactivate, reactivate),
    invoices: Object.assign(invoices, invoices),
}

export default subscribers