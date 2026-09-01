import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::handle
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
export const handle = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

handle.definition = {
    methods: ["post"],
    url: '/api/webhooks/telegram',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::handle
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
handle.url = (options?: RouteQueryOptions) => {
    return handle.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::handle
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
handle.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::handle
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
const handleForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::handle
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
handleForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handle.url(options),
    method: 'post',
})

handle.form = handleForm

const TelegramWebhookController = { handle }

export default TelegramWebhookController