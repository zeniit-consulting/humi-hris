import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
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
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::create
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
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
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::sendOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:38
* @route '/portal/login/send-otp'
*/
export const sendOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendOtp.url(options),
    method: 'post',
})

sendOtp.definition = {
    methods: ["post"],
    url: '/portal/login/send-otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::sendOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:38
* @route '/portal/login/send-otp'
*/
sendOtp.url = (options?: RouteQueryOptions) => {
    return sendOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::sendOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:38
* @route '/portal/login/send-otp'
*/
sendOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::sendOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:38
* @route '/portal/login/send-otp'
*/
const sendOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::sendOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:38
* @route '/portal/login/send-otp'
*/
sendOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendOtp.url(options),
    method: 'post',
})

sendOtp.form = sendOtpForm

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::verifyOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:61
* @route '/portal/login/verify-otp'
*/
export const verifyOtp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.definition = {
    methods: ["post"],
    url: '/portal/login/verify-otp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::verifyOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:61
* @route '/portal/login/verify-otp'
*/
verifyOtp.url = (options?: RouteQueryOptions) => {
    return verifyOtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::verifyOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:61
* @route '/portal/login/verify-otp'
*/
verifyOtp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::verifyOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:61
* @route '/portal/login/verify-otp'
*/
const verifyOtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::verifyOtp
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:61
* @route '/portal/login/verify-otp'
*/
verifyOtpForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verifyOtp.url(options),
    method: 'post',
})

verifyOtp.form = verifyOtpForm

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithPassword
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
export const loginWithPassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: loginWithPassword.url(options),
    method: 'post',
})

loginWithPassword.definition = {
    methods: ["post"],
    url: '/portal/login/password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithPassword
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
loginWithPassword.url = (options?: RouteQueryOptions) => {
    return loginWithPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithPassword
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
loginWithPassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: loginWithPassword.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithPassword
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
const loginWithPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: loginWithPassword.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::loginWithPassword
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
loginWithPasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: loginWithPassword.url(options),
    method: 'post',
})

loginWithPassword.form = loginWithPasswordForm

const PortalOtpLoginController = { create, sendOtp, verifyOtp, loginWithPassword }

export default PortalOtpLoginController