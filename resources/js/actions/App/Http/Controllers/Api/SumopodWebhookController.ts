import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
const SumopodWebhookController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: SumopodWebhookController.url(options),
    method: 'post',
})

SumopodWebhookController.definition = {
    methods: ["post"],
    url: '/api/webhooks/sumopod',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
SumopodWebhookController.url = (options?: RouteQueryOptions) => {
    return SumopodWebhookController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
SumopodWebhookController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: SumopodWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
const SumopodWebhookControllerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: SumopodWebhookController.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
SumopodWebhookControllerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: SumopodWebhookController.url(options),
    method: 'post',
})

SumopodWebhookController.form = SumopodWebhookControllerForm

export default SumopodWebhookController