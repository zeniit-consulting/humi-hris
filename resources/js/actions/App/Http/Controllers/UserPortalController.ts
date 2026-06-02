import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
const UserPortalController = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserPortalController.url(options),
    method: 'get',
})

UserPortalController.definition = {
    methods: ["get","head"],
    url: '/portal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
UserPortalController.url = (options?: RouteQueryOptions) => {
    return UserPortalController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
UserPortalController.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: UserPortalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
UserPortalController.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: UserPortalController.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
const UserPortalControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserPortalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
UserPortalControllerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserPortalController.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
UserPortalControllerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: UserPortalController.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

UserPortalController.form = UserPortalControllerForm

export default UserPortalController