import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/activate-account',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::show
* @see app/Http/Controllers/Auth/EmailActivationController.php:20
* @route '/activate-account'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::send
* @see app/Http/Controllers/Auth/EmailActivationController.php:40
* @route '/activate-account/send'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/activate-account/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::send
* @see app/Http/Controllers/Auth/EmailActivationController.php:40
* @route '/activate-account/send'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::send
* @see app/Http/Controllers/Auth/EmailActivationController.php:40
* @route '/activate-account/send'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::send
* @see app/Http/Controllers/Auth/EmailActivationController.php:40
* @route '/activate-account/send'
*/
const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::send
* @see app/Http/Controllers/Auth/EmailActivationController.php:40
* @route '/activate-account/send'
*/
sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

send.form = sendForm

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::verify
* @see app/Http/Controllers/Auth/EmailActivationController.php:65
* @route '/activate-account/verify'
*/
export const verify = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

verify.definition = {
    methods: ["post"],
    url: '/activate-account/verify',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::verify
* @see app/Http/Controllers/Auth/EmailActivationController.php:65
* @route '/activate-account/verify'
*/
verify.url = (options?: RouteQueryOptions) => {
    return verify.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::verify
* @see app/Http/Controllers/Auth/EmailActivationController.php:65
* @route '/activate-account/verify'
*/
verify.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::verify
* @see app/Http/Controllers/Auth/EmailActivationController.php:65
* @route '/activate-account/verify'
*/
const verifyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\EmailActivationController::verify
* @see app/Http/Controllers/Auth/EmailActivationController.php:65
* @route '/activate-account/verify'
*/
verifyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: verify.url(options),
    method: 'post',
})

verify.form = verifyForm

const EmailActivationController = { show, send, verify }

export default EmailActivationController