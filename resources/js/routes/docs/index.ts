import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import manual8a44cf from './manual'
/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
export const manual = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manual.url(options),
    method: 'get',
})

manual.definition = {
    methods: ["get","head"],
    url: '//docs.hris.test/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
manual.url = (options?: RouteQueryOptions) => {
    return manual.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
manual.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manual.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
manual.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manual.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
const manualForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manual.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
manualForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manual.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\DocsManualController::__invoke
* @see app/Http/Controllers/DocsManualController.php:11
* @route '//docs.hris.test/'
*/
manualForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manual.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manual.form = manualForm

const docs = {
    manual: Object.assign(manual, manual8a44cf),
}

export default docs