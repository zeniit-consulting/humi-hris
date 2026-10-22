import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/vacancies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::index
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
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
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
export const show = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/vacancies/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
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
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
show.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
show.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
const showForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::show
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
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
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::store
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/third-party/v1/recruitment/vacancies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::store
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::store
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::store
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::store
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::update
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
export const update = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/third-party/v1/recruitment/vacancies/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::update
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
update.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::update
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
update.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::update
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
const updateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::update
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
updateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const vacancies = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
}

export default vacancies