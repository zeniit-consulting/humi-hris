import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:13
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
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:13
* @route '/portal/api/push-devices'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:13
* @route '/portal/api/push-devices'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:13
* @route '/portal/api/push-devices'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::store
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:13
* @route '/portal/api/push-devices'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:38
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
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:38
* @route '/portal/api/push-devices'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:38
* @route '/portal/api/push-devices'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\PortalPushDeviceController::destroy
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:38
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
* @see app/Http/Controllers/Api/PortalPushDeviceController.php:38
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

const pushDevices = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default pushDevices