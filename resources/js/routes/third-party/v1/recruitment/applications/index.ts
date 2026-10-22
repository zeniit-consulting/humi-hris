import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/applications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/applications/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
show.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return show.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateStage
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:327
* @route '/api/third-party/v1/recruitment/applications/{id}/stage'
*/
export const updateStage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStage.url(args, options),
    method: 'put',
})

updateStage.definition = {
    methods: ["put"],
    url: '/api/third-party/v1/recruitment/applications/{id}/stage',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateStage
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:327
* @route '/api/third-party/v1/recruitment/applications/{id}/stage'
*/
updateStage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return updateStage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateStage
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:327
* @route '/api/third-party/v1/recruitment/applications/{id}/stage'
*/
updateStage.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateStage.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateStage
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:327
* @route '/api/third-party/v1/recruitment/applications/{id}/stage'
*/
const updateStageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateStage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateStage
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:327
* @route '/api/third-party/v1/recruitment/applications/{id}/stage'
*/
updateStageForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateStage.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateStage.form = updateStageForm

const applications = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    updateStage: Object.assign(updateStage, updateStage),
}

export default applications