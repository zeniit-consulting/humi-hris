import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
export const preview = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

preview.definition = {
    methods: ["get","head"],
    url: '/portal/api/payrolls/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
preview.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
preview.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
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

/**
* @see \App\Http\Controllers\UserPortalSectionController::previewSecure
* @see app/Http/Controllers/UserPortalSectionController.php:114
* @route '/portal/api/payrolls/preview-secure'
*/
export const previewSecure = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: previewSecure.url(options),
    method: 'post',
})

previewSecure.definition = {
    methods: ["post"],
    url: '/portal/api/payrolls/preview-secure',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::previewSecure
* @see app/Http/Controllers/UserPortalSectionController.php:114
* @route '/portal/api/payrolls/preview-secure'
*/
previewSecure.url = (options?: RouteQueryOptions) => {
    return previewSecure.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::previewSecure
* @see app/Http/Controllers/UserPortalSectionController.php:114
* @route '/portal/api/payrolls/preview-secure'
*/
previewSecure.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: previewSecure.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::previewSecure
* @see app/Http/Controllers/UserPortalSectionController.php:114
* @route '/portal/api/payrolls/preview-secure'
*/
const previewSecureForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: previewSecure.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::previewSecure
* @see app/Http/Controllers/UserPortalSectionController.php:114
* @route '/portal/api/payrolls/preview-secure'
*/
previewSecureForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: previewSecure.url(options),
    method: 'post',
})

previewSecure.form = previewSecureForm

const payrolls = {
    preview: Object.assign(preview, preview),
    previewSecure: Object.assign(previewSecure, previewSecure),
}

export default payrolls