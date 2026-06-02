import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:96
* @route '/api/mobile/v1/profile/bank-account'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/profile/bank-account',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:96
* @route '/api/mobile/v1/profile/bank-account'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:96
* @route '/api/mobile/v1/profile/bank-account'
*/
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::update
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:96
* @route '/api/mobile/v1/profile/bank-account'
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
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:96
* @route '/api/mobile/v1/profile/bank-account'
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

const bankAccount = {
    update: Object.assign(update, update),
}

export default bankAccount