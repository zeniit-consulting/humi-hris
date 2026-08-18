import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:65
* @route '/portal/api/push-devices'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/portal/api/push-devices',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:65
* @route '/portal/api/push-devices'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:65
* @route '/portal/api/push-devices'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:65
* @route '/portal/api/push-devices'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:65
* @route '/portal/api/push-devices'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:90
* @route '/portal/api/push-devices'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/portal/api/push-devices',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:90
* @route '/portal/api/push-devices'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:90
* @route '/portal/api/push-devices'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:90
* @route '/portal/api/push-devices'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:90
* @route '/portal/api/push-devices'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::storeWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:15
* @route '/portal/api/web-push-subscriptions'
*/
export const storeWebPushSubscription = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWebPushSubscription.url(options),
    method: 'post',
})

storeWebPushSubscription.definition = {
    methods: ["post"],
    url: '/portal/api/web-push-subscriptions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::storeWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:15
* @route '/portal/api/web-push-subscriptions'
*/
storeWebPushSubscription.url = (options?: RouteQueryOptions) => {
    return storeWebPushSubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::storeWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:15
* @route '/portal/api/web-push-subscriptions'
*/
storeWebPushSubscription.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeWebPushSubscription.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::storeWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:15
* @route '/portal/api/web-push-subscriptions'
*/
const storeWebPushSubscriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWebPushSubscription.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::storeWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:15
* @route '/portal/api/web-push-subscriptions'
*/
storeWebPushSubscriptionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeWebPushSubscription.url(options),
    method: 'post',
})

storeWebPushSubscription.form = storeWebPushSubscriptionForm

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroyWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:49
* @route '/portal/api/web-push-subscriptions'
*/
export const destroyWebPushSubscription = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWebPushSubscription.url(options),
    method: 'delete',
})

destroyWebPushSubscription.definition = {
    methods: ["delete"],
    url: '/portal/api/web-push-subscriptions',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroyWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:49
* @route '/portal/api/web-push-subscriptions'
*/
destroyWebPushSubscription.url = (options?: RouteQueryOptions) => {
    return destroyWebPushSubscription.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroyWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:49
* @route '/portal/api/web-push-subscriptions'
*/
destroyWebPushSubscription.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyWebPushSubscription.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroyWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:49
* @route '/portal/api/web-push-subscriptions'
*/
const destroyWebPushSubscriptionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWebPushSubscription.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroyWebPushSubscription
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:49
* @route '/portal/api/web-push-subscriptions'
*/
destroyWebPushSubscriptionForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyWebPushSubscription.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyWebPushSubscription.form = destroyWebPushSubscriptionForm

const PortalPushDeviceController = { store, destroy, storeWebPushSubscription, destroyWebPushSubscription }

export default PortalPushDeviceController