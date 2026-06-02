import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
const DocsManualController78fc3d9be3433104edea929cd7562671 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController78fc3d9be3433104edea929cd7562671.url(options),
    method: 'get',
})

DocsManualController78fc3d9be3433104edea929cd7562671.definition = {
    methods: ["get","head"],
    url: '//docs.humi.my.id/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
DocsManualController78fc3d9be3433104edea929cd7562671.url = (options?: RouteQueryOptions) => {
    return DocsManualController78fc3d9be3433104edea929cd7562671.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
DocsManualController78fc3d9be3433104edea929cd7562671.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: DocsManualController78fc3d9be3433104edea929cd7562671.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
DocsManualController78fc3d9be3433104edea929cd7562671.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: DocsManualController78fc3d9be3433104edea929cd7562671.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
const DocsManualController78fc3d9be3433104edea929cd7562671Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController78fc3d9be3433104edea929cd7562671.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
DocsManualController78fc3d9be3433104edea929cd7562671Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController78fc3d9be3433104edea929cd7562671.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.humi.my.id/'
*/
DocsManualController78fc3d9be3433104edea929cd7562671Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: DocsManualController78fc3d9be3433104edea929cd7562671.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

DocsManualController78fc3d9be3433104edea929cd7562671.form = DocsManualController78fc3d9be3433104edea929cd7562671Form
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
    '//docs.humi.my.id/': DocsManualController78fc3d9be3433104edea929cd7562671,
    '/docs': DocsManualController09f19fee25de3507901aa68cef1f226a,
}

export default DocsManualController