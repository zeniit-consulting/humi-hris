import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import responses from './responses'
/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/surveys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::index
* @see app/Http/Controllers/Hris/SurveyController.php:18
* @route '/hris/surveys'
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
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:68
* @route '/hris/surveys'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/surveys',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:68
* @route '/hris/surveys'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:68
* @route '/hris/surveys'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:68
* @route '/hris/surveys'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:68
* @route '/hris/surveys'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\SurveyController::update
* @see app/Http/Controllers/Hris/SurveyController.php:75
* @route '/hris/surveys/{survey}'
*/
export const update = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/surveys/{survey}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\SurveyController::update
* @see app/Http/Controllers/Hris/SurveyController.php:75
* @route '/hris/surveys/{survey}'
*/
update.url = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { survey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { survey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            survey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        survey: typeof args.survey === 'object'
        ? args.survey.id
        : args.survey,
    }

    return update.definition.url
            .replace('{survey}', parsedArgs.survey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SurveyController::update
* @see app/Http/Controllers/Hris/SurveyController.php:75
* @route '/hris/surveys/{survey}'
*/
update.put = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::update
* @see app/Http/Controllers/Hris/SurveyController.php:75
* @route '/hris/surveys/{survey}'
*/
const updateForm = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::update
* @see app/Http/Controllers/Hris/SurveyController.php:75
* @route '/hris/surveys/{survey}'
*/
updateForm.put = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Hris\SurveyController::destroy
* @see app/Http/Controllers/Hris/SurveyController.php:82
* @route '/hris/surveys/{survey}'
*/
export const destroy = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/surveys/{survey}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\SurveyController::destroy
* @see app/Http/Controllers/Hris/SurveyController.php:82
* @route '/hris/surveys/{survey}'
*/
destroy.url = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { survey: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { survey: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            survey: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        survey: typeof args.survey === 'object'
        ? args.survey.id
        : args.survey,
    }

    return destroy.definition.url
            .replace('{survey}', parsedArgs.survey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SurveyController::destroy
* @see app/Http/Controllers/Hris/SurveyController.php:82
* @route '/hris/surveys/{survey}'
*/
destroy.delete = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::destroy
* @see app/Http/Controllers/Hris/SurveyController.php:82
* @route '/hris/surveys/{survey}'
*/
const destroyForm = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::destroy
* @see app/Http/Controllers/Hris/SurveyController.php:82
* @route '/hris/surveys/{survey}'
*/
destroyForm.delete = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const surveys = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    responses: Object.assign(responses, responses),
}

export default surveys