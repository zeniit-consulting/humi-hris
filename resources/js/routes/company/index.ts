import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\CompanySettingController::update
* @see app/Http/Controllers/Settings/CompanySettingController.php:19
* @route '/settings/company'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/company',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\CompanySettingController::update
* @see app/Http/Controllers/Settings/CompanySettingController.php:19
* @route '/settings/company'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\CompanySettingController::update
* @see app/Http/Controllers/Settings/CompanySettingController.php:19
* @route '/settings/company'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\CompanySettingController::update
* @see app/Http/Controllers/Settings/CompanySettingController.php:19
* @route '/settings/company'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\CompanySettingController::update
* @see app/Http/Controllers/Settings/CompanySettingController.php:19
* @route '/settings/company'
*/
updateForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const company = {
    update: Object.assign(update, update),
}

export default company