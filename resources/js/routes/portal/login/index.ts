import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
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
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::password
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
export const password = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: password.url(options),
    method: 'post',
})

password.definition = {
    methods: ["post"],
    url: '/portal/login/password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::password
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
password.url = (options?: RouteQueryOptions) => {
    return password.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::password
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
password.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: password.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::password
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
const passwordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: password.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::password
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:100
* @route '/portal/login/password'
*/
passwordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: password.url(options),
    method: 'post',
})

password.form = passwordForm

const login = {
    sendOtp: Object.assign(sendOtp, sendOtp),
    verifyOtp: Object.assign(verifyOtp, verifyOtp),
    password: Object.assign(password, password),
}

export default login