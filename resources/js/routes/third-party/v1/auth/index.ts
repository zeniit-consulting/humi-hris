import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import token0f65b5 from './token'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::token
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
export const token = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: token.url(options),
    method: 'post',
})

token.definition = {
    methods: ["post"],
    url: '/api/third-party/v1/auth/token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::token
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
token.url = (options?: RouteQueryOptions) => {
    return token.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::token
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
token.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: token.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::token
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
const tokenForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: token.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\AuthController::token
* @see app/Http/Controllers/Api/ThirdParty/V1/AuthController.php:16
* @route '/api/third-party/v1/auth/token'
*/
tokenForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: token.url(options),
    method: 'post',
})

token.form = tokenForm

const auth = {
    token: Object.assign(token, token0f65b5),
}

export default auth