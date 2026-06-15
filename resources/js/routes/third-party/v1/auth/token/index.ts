import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revoke
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
export const revoke = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(options),
    method: 'delete',
})

revoke.definition = {
    methods: ["delete"],
    url: '/api/third-party/v1/auth/token',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revoke
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revoke.url = (options?: RouteQueryOptions) => {
    return revoke.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revoke
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revoke.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revoke.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revoke
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
const revokeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revoke
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revokeForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revoke.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

revoke.form = revokeForm

const token = {
    revoke: Object.assign(revoke, revoke),
}

export default token