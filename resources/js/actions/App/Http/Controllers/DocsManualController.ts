import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
const DocsManualControllerab4c3a249dfcc307944d0798786a05ef = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url(options),
    method: 'get',
})

DocsManualControllerab4c3a249dfcc307944d0798786a05ef.definition = {
    methods: ["get","head"],
    url: '//docs.hris.test/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url = (options?: RouteQueryOptions) => {
    return DocsManualControllerab4c3a249dfcc307944d0798786a05ef.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
DocsManualControllerab4c3a249dfcc307944d0798786a05ef.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
DocsManualControllerab4c3a249dfcc307944d0798786a05ef.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
const DocsManualControllerab4c3a249dfcc307944d0798786a05efForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
DocsManualControllerab4c3a249dfcc307944d0798786a05efForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
DocsManualControllerab4c3a249dfcc307944d0798786a05efForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualControllerab4c3a249dfcc307944d0798786a05ef.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

DocsManualControllerab4c3a249dfcc307944d0798786a05ef.form = DocsManualControllerab4c3a249dfcc307944d0798786a05efForm
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
    '//docs.hris.test/': DocsManualControllerab4c3a249dfcc307944d0798786a05ef,
    '/docs': DocsManualController09f19fee25de3507901aa68cef1f226a,
}

export default DocsManualController