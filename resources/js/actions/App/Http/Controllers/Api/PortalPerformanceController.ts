import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/performances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::index
* @see app/Http/Controllers/Api/PortalPerformanceController.php:21
* @route '/portal/api/performances'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::storeCheckIn
* @see app/Http/Controllers/Api/PortalPerformanceController.php:50
* @route '/portal/api/performances/{review}/check-ins'
*/
export const storeCheckIn = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCheckIn.url(args, options),
    method: 'post',
})

storeCheckIn.definition = {
    methods: ["post"],
    url: '/portal/api/performances/{review}/check-ins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::storeCheckIn
* @see app/Http/Controllers/Api/PortalPerformanceController.php:50
* @route '/portal/api/performances/{review}/check-ins'
*/
storeCheckIn.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return storeCheckIn.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::storeCheckIn
* @see app/Http/Controllers/Api/PortalPerformanceController.php:50
* @route '/portal/api/performances/{review}/check-ins'
*/
storeCheckIn.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCheckIn.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::storeCheckIn
* @see app/Http/Controllers/Api/PortalPerformanceController.php:50
* @route '/portal/api/performances/{review}/check-ins'
*/
const storeCheckInForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCheckIn.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalPerformanceController::storeCheckIn
* @see app/Http/Controllers/Api/PortalPerformanceController.php:50
* @route '/portal/api/performances/{review}/check-ins'
*/
storeCheckInForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCheckIn.url(args, options),
    method: 'post',
})

storeCheckIn.form = storeCheckInForm

const PortalPerformanceController = { index, storeCheckIn }

export default PortalPerformanceController