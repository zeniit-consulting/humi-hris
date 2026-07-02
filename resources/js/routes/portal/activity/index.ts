import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
export const clientVisits = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clientVisits.url(options),
    method: 'get',
})

clientVisits.definition = {
    methods: ["get","head"],
    url: '/portal/activity/client-visits',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
clientVisits.url = (options?: RouteQueryOptions) => {
    return clientVisits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
clientVisits.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: clientVisits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
clientVisits.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: clientVisits.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
const clientVisitsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clientVisits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
clientVisitsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clientVisits.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::clientVisits
* @see app/Http/Controllers/UserPortalSectionController.php:71
* @route '/portal/activity/client-visits'
*/
clientVisitsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: clientVisits.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

clientVisits.form = clientVisitsForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
export const performance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: performance.url(options),
    method: 'get',
})

performance.definition = {
    methods: ["get","head"],
    url: '/portal/activity/performance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
performance.url = (options?: RouteQueryOptions) => {
    return performance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
performance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: performance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
performance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: performance.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
const performanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: performance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
performanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: performance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::performance
* @see app/Http/Controllers/UserPortalSectionController.php:76
* @route '/portal/activity/performance'
*/
performanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: performance.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

performance.form = performanceForm

const activity = {
    clientVisits: Object.assign(clientVisits, clientVisits),
    performance: Object.assign(performance, performance),
}

export default activity