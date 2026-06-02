import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/settings/whatsapp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::show
* @see app/Http/Controllers/Settings/WhatsappTestController.php:18
* @route '/settings/whatsapp'
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
* @see \App\Http\Controllers\Settings\WhatsappTestController::send
* @see app/Http/Controllers/Settings/WhatsappTestController.php:26
* @route '/settings/whatsapp/send'
*/
export const send = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

send.definition = {
    methods: ["post"],
    url: '/settings/whatsapp/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::send
* @see app/Http/Controllers/Settings/WhatsappTestController.php:26
* @route '/settings/whatsapp/send'
*/
send.url = (options?: RouteQueryOptions) => {
    return send.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::send
* @see app/Http/Controllers/Settings/WhatsappTestController.php:26
* @route '/settings/whatsapp/send'
*/
send.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::send
* @see app/Http/Controllers/Settings/WhatsappTestController.php:26
* @route '/settings/whatsapp/send'
*/
const sendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\WhatsappTestController::send
* @see app/Http/Controllers/Settings/WhatsappTestController.php:26
* @route '/settings/whatsapp/send'
*/
sendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: send.url(options),
    method: 'post',
})

send.form = sendForm

const whatsapp = {
    show: Object.assign(show, show),
    send: Object.assign(send, send),
}

export default whatsapp