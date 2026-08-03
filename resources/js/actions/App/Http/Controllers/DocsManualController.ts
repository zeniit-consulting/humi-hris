import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
const DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url(options),
    method: 'get',
})

DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.definition = {
    methods: ["get","head"],
    url: '//docs.127.0.0.1/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url = (options?: RouteQueryOptions) => {
    return DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
const DocsManualController465e58b17a6bc3b7b4c66edf4e3b85daForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
DocsManualController465e58b17a6bc3b7b4c66edf4e3b85daForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.127.0.0.1/'
*/
DocsManualController465e58b17a6bc3b7b4c66edf4e3b85daForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da.form = DocsManualController465e58b17a6bc3b7b4c66edf4e3b85daForm
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
const DocsManualController09f19fee25de3507901aa68cef1f226a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

DocsManualController09f19fee25de3507901aa68cef1f226a.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
DocsManualController09f19fee25de3507901aa68cef1f226a.url = (options?: RouteQueryOptions) => {
    return DocsManualController09f19fee25de3507901aa68cef1f226a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
DocsManualController09f19fee25de3507901aa68cef1f226a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
DocsManualController09f19fee25de3507901aa68cef1f226a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocsManualController09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
const DocsManualController09f19fee25de3507901aa68cef1f226aForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
DocsManualController09f19fee25de3507901aa68cef1f226aForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
DocsManualController09f19fee25de3507901aa68cef1f226aForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController09f19fee25de3507901aa68cef1f226a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

DocsManualController09f19fee25de3507901aa68cef1f226a.form = DocsManualController09f19fee25de3507901aa68cef1f226aForm

const DocsManualController = {
    '//docs.127.0.0.1/': DocsManualController465e58b17a6bc3b7b4c66edf4e3b85da,
    '/docs': DocsManualController09f19fee25de3507901aa68cef1f226a,
}

export default DocsManualController