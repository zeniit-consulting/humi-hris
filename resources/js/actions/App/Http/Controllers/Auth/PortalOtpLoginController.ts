import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/portal/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:23
* @route '/portal/login'
*/
createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

create.form = createForm

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithWhatsApp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
export const loginWithWhatsApp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: loginWithWhatsApp.url(options),
    method: 'post',
})

loginWithWhatsApp.definition = {
    methods: ["post"],
    url: '/portal/login/authenticate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithWhatsApp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
loginWithWhatsApp.url = (options?: RouteQueryOptions) => {
    return loginWithWhatsApp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithWhatsApp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
loginWithWhatsApp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: loginWithWhatsApp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithWhatsApp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
const loginWithWhatsAppForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: loginWithWhatsApp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithWhatsApp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:32
* @route '/portal/login/authenticate'
*/
loginWithWhatsAppForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: loginWithWhatsApp.url(options),
    method: 'post',
})

loginWithWhatsApp.form = loginWithWhatsAppForm

const PortalOtpLoginController = { create, loginWithWhatsApp }

export default PortalOtpLoginController