import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/password',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::edit
* @see app/Http/Controllers/Settings/PasswordController.php:18
* @route '/settings/password'
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
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see app/Http/Controllers/Settings/PasswordController.php:28
* @route '/settings/password'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/settings/password',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see app/Http/Controllers/Settings/PasswordController.php:28
* @route '/settings/password'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see app/Http/Controllers/Settings/PasswordController.php:28
* @route '/settings/password'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see app/Http/Controllers/Settings/PasswordController.php:28
* @route '/settings/password'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::update
* @see app/Http/Controllers/Settings/PasswordController.php:28
* @route '/settings/password'
*/
updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Settings\PasswordController::skip
* @see app/Http/Controllers/Settings/PasswordController.php:42
* @route '/settings/password/skip'
*/
export const skip = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: skip.url(options),
    method: 'post',
})

skip.definition = {
    methods: ["post"],
    url: '/settings/password/skip',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PasswordController::skip
* @see app/Http/Controllers/Settings/PasswordController.php:42
* @route '/settings/password/skip'
*/
skip.url = (options?: RouteQueryOptions) => {
    return skip.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PasswordController::skip
* @see app/Http/Controllers/Settings/PasswordController.php:42
* @route '/settings/password/skip'
*/
skip.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: skip.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::skip
* @see app/Http/Controllers/Settings/PasswordController.php:42
* @route '/settings/password/skip'
*/
const skipForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: skip.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PasswordController::skip
* @see app/Http/Controllers/Settings/PasswordController.php:42
* @route '/settings/password/skip'
*/
skipForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: skip.url(options),
    method: 'post',
})

skip.form = skipForm

const userPassword = {
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    skip: Object.assign(skip, skip),
}

export default userPassword