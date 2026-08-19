import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::edit
* @see app/Http/Controllers/Settings/PayrollSettingController.php:15
* @route '/settings/payroll'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::update
* @see app/Http/Controllers/Settings/PayrollSettingController.php:42
* @route '/settings/payroll'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/payroll',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::update
* @see app/Http/Controllers/Settings/PayrollSettingController.php:42
* @route '/settings/payroll'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::update
* @see app/Http/Controllers/Settings/PayrollSettingController.php:42
* @route '/settings/payroll'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\PayrollSettingController::update
* @see app/Http/Controllers/Settings/PayrollSettingController.php:42
* @route '/settings/payroll'
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
* @see \App\Http\Controllers\Settings\PayrollSettingController::update
* @see app/Http/Controllers/Settings/PayrollSettingController.php:42
* @route '/settings/payroll'
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

const payroll = {
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
}

export default payroll