import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::issueToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
export const issueToken = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: issueToken.url(options),
    method: 'post',
})

issueToken.definition = {
    methods: ["post"],
    url: '/api/third-party/v1/auth/token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::issueToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
issueToken.url = (options?: RouteQueryOptions) => {
    return issueToken.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::issueToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
issueToken.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: issueToken.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::issueToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
const issueTokenForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: issueToken.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::issueToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
issueTokenForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: issueToken.url(options),
    method: 'post',
})

issueToken.form = issueTokenForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revokeCurrentToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
export const revokeCurrentToken = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revokeCurrentToken.url(options),
    method: 'delete',
})

revokeCurrentToken.definition = {
    methods: ["delete"],
    url: '/api/third-party/v1/auth/token',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revokeCurrentToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revokeCurrentToken.url = (options?: RouteQueryOptions) => {
    return revokeCurrentToken.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revokeCurrentToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revokeCurrentToken.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revokeCurrentToken.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revokeCurrentToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
const revokeCurrentTokenForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeCurrentToken.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::revokeCurrentToken
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:65
* @route '/api/third-party/v1/auth/token'
*/
revokeCurrentTokenForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revokeCurrentToken.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

revokeCurrentToken.form = revokeCurrentTokenForm

const AuthController = { issueToken, revokeCurrentToken }

export default AuthController