import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\UserPortalSectionController::exportMethod
* @see app/Http/Controllers/UserPortalSectionController.php:140
* @route '/portal/payroll/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

exportMethod.definition = {
    methods: ["post"],
    url: '/portal/payroll/export',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::exportMethod
* @see app/Http/Controllers/UserPortalSectionController.php:140
* @route '/portal/payroll/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::exportMethod
* @see app/Http/Controllers/UserPortalSectionController.php:140
* @route '/portal/payroll/export'
*/
exportMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::exportMethod
* @see app/Http/Controllers/UserPortalSectionController.php:140
* @route '/portal/payroll/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: exportMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::exportMethod
* @see app/Http/Controllers/UserPortalSectionController.php:140
* @route '/portal/payroll/export'
*/
exportMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: exportMethod.url(options),
    method: 'post',
})

exportMethod.form = exportMethodForm

const payroll = {
    export: Object.assign(exportMethod, exportMethod),
}

export default payroll