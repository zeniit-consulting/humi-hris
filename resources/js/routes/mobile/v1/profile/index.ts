import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
import bankAccount from './bank-account'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:20
* @route '/api/mobile/v1/profile'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:74
* @route '/api/mobile/v1/profile'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:74
* @route '/api/mobile/v1/profile'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:74
* @route '/api/mobile/v1/profile'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:74
* @route '/api/mobile/v1/profile'
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
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:74
* @route '/api/mobile/v1/profile'
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

const profile = {
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    bankAccount: Object.assign(bankAccount, bankAccount),
}

export default profile