import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
export const preview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
preview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
preview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
previewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '/docs'
*/
previewForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview.form = previewForm

const manual = {
    preview: Object.assign(preview, preview),
}

export default manual