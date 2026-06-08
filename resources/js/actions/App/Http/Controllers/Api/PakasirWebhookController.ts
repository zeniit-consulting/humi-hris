import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
const PakasirWebhookController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: PakasirWebhookController.url(options),
    method: 'post',
})

PakasirWebhookController.definition = {
    methods: ["post"],
    url: '/api/webhooks/pakasir',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
PakasirWebhookController.url = (options?: RouteQueryOptions) => {
    return PakasirWebhookController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
PakasirWebhookController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: PakasirWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
const PakasirWebhookControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: PakasirWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PakasirWebhookController::__invoke
* @see app/Http/Controllers/Api/PakasirWebhookController.php:23
* @route '/api/webhooks/pakasir'
*/
PakasirWebhookControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: PakasirWebhookController.url(options),
    method: 'post',
})

PakasirWebhookController.form = PakasirWebhookControllerForm

export default PakasirWebhookController