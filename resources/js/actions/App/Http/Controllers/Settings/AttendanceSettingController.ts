import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::edit
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:15
* @route '/settings/attendance'
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
* @see \App\Http\Controllers\Settings\AttendanceSettingController::update
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:28
* @route '/settings/attendance'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/attendance',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::update
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:28
* @route '/settings/attendance'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::update
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:28
* @route '/settings/attendance'
*/
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\AttendanceSettingController::update
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:28
* @route '/settings/attendance'
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
* @see \App\Http\Controllers\Settings\AttendanceSettingController::update
* @see app/Http/Controllers/Settings/AttendanceSettingController.php:28
* @route '/settings/attendance'
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

const AttendanceSettingController = { edit, update }

export default AttendanceSettingController