import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::update
* @see app/Http/Controllers/Hris/OrganizationChartController.php:118
* @route '/hris/organization-chart/exclusions'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/hris/organization-chart/exclusions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::update
* @see app/Http/Controllers/Hris/OrganizationChartController.php:118
* @route '/hris/organization-chart/exclusions'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::update
* @see app/Http/Controllers/Hris/OrganizationChartController.php:118
* @route '/hris/organization-chart/exclusions'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::update
* @see app/Http/Controllers/Hris/OrganizationChartController.php:118
* @route '/hris/organization-chart/exclusions'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\OrganizationChartController::update
* @see app/Http/Controllers/Hris/OrganizationChartController.php:118
* @route '/hris/organization-chart/exclusions'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const exclusions = {
    update: Object.assign(update, update),
}

export default exclusions