import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::authenticate
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
export const authenticate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: authenticate.url(options),
    method: 'post',
})

authenticate.definition = {
    methods: ["post"],
    url: '/portal/login/authenticate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::authenticate
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
authenticate.url = (options?: RouteQueryOptions) => {
    return authenticate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::authenticate
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
authenticate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: authenticate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::authenticate
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
const authenticateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: authenticate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::authenticate
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
authenticateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: authenticate.url(options),
    method: 'post',
})

authenticate.form = authenticateForm

const login = {
    authenticate: Object.assign(authenticate, authenticate),
}

export default login