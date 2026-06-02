import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::update
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
export const update = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/subscribers/{subscriber}/subscription',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::update
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
update.url = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{subscriber}', parsedArgs.subscriber.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::update
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
update.put = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::update
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
const updateForm = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\SubscriberManagementController::update
* @see app/Http/Controllers/Admin/SubscriberManagementController.php:294
* @route '/admin/subscribers/{subscriber}/subscription'
*/
updateForm.put = (args: { subscriber: number | { id: number } } | [subscriber: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const subscription = {
    update: Object.assign(update, update),
}

export default subscription