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

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
export const sumopod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sumopod.url(options),
    method: 'post',
})

sumopod.definition = {
    methods: ["post"],
    url: '/api/webhooks/sumopod',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
sumopod.url = (options?: RouteQueryOptions) => {
    return sumopod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
sumopod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sumopod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
const sumopodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sumopod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\SumopodWebhookController::__invoke
* @see app/Http/Controllers/Api/SumopodWebhookController.php:19
* @route '/api/webhooks/sumopod'
*/
sumopodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sumopod.url(options),
    method: 'post',
})

sumopod.form = sumopodForm

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::telegram
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
export const telegram = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: telegram.url(options),
    method: 'post',
})

telegram.definition = {
    methods: ["post"],
    url: '/api/webhooks/telegram',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::telegram
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
telegram.url = (options?: RouteQueryOptions) => {
    return telegram.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::telegram
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
telegram.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: telegram.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::telegram
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
const telegramForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: telegram.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\TelegramWebhookController::telegram
* @see app/Http/Controllers/Api/TelegramWebhookController.php:33
* @route '/api/webhooks/telegram'
*/
telegramForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: telegram.url(options),
    method: 'post',
})

telegram.form = telegramForm

const webhooks = {
    pakasir: Object.assign(pakasir, pakasir),
    sumopod: Object.assign(sumopod, sumopod),
    telegram: Object.assign(telegram, telegram),
}

export default webhooks