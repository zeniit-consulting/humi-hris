import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
export const pakasir = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pakasir.url(options),
    method: 'post',
})

pakasir.definition = {
    methods: ["post"],
    url: '/api/webhooks/pakasir',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
pakasir.url = (options?: RouteQueryOptions) => {
    return pakasir.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
pakasir.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: pakasir.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
const pakasirForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pakasir.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
pakasirForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: pakasir.url(options),
    method: 'post',
})

pakasir.form = pakasirForm

const webhooks = {
    pakasir: Object.assign(pakasir, pakasir),
}

export default webhooks