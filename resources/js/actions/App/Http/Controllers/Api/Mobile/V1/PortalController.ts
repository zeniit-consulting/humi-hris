import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
const summaryfab4dca6dc7fbcdf0f4e49c954b03729 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url(options),
    method: 'get',
})

summaryfab4dca6dc7fbcdf0f4e49c954b03729.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/portal/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryfab4dca6dc7fbcdf0f4e49c954b03729.url = (options?: RouteQueryOptions) => {
    return summaryfab4dca6dc7fbcdf0f4e49c954b03729.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryfab4dca6dc7fbcdf0f4e49c954b03729.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryfab4dca6dc7fbcdf0f4e49c954b03729.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
const summaryfab4dca6dc7fbcdf0f4e49c954b03729Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryfab4dca6dc7fbcdf0f4e49c954b03729Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/api/mobile/v1/portal/summary'
*/
summaryfab4dca6dc7fbcdf0f4e49c954b03729Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summaryfab4dca6dc7fbcdf0f4e49c954b03729.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

summaryfab4dca6dc7fbcdf0f4e49c954b03729.form = summaryfab4dca6dc7fbcdf0f4e49c954b03729Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
const summary8444c38db3cb3fa686498eb03d3ad9c7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary8444c38db3cb3fa686498eb03d3ad9c7.url(options),
    method: 'get',
})

summary8444c38db3cb3fa686498eb03d3ad9c7.definition = {
    methods: ["get","head"],
    url: '/portal/api/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary8444c38db3cb3fa686498eb03d3ad9c7.url = (options?: RouteQueryOptions) => {
    return summary8444c38db3cb3fa686498eb03d3ad9c7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary8444c38db3cb3fa686498eb03d3ad9c7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary8444c38db3cb3fa686498eb03d3ad9c7.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary8444c38db3cb3fa686498eb03d3ad9c7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary8444c38db3cb3fa686498eb03d3ad9c7.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
const summary8444c38db3cb3fa686498eb03d3ad9c7Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary8444c38db3cb3fa686498eb03d3ad9c7.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary8444c38db3cb3fa686498eb03d3ad9c7Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary8444c38db3cb3fa686498eb03d3ad9c7.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary8444c38db3cb3fa686498eb03d3ad9c7Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary8444c38db3cb3fa686498eb03d3ad9c7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

summary8444c38db3cb3fa686498eb03d3ad9c7.form = summary8444c38db3cb3fa686498eb03d3ad9c7Form

export const summary = {
    '/api/mobile/v1/portal/summary': summaryfab4dca6dc7fbcdf0f4e49c954b03729,
    '/portal/api/summary': summary8444c38db3cb3fa686498eb03d3ad9c7,
}

const PortalController = { summary }

export default PortalController