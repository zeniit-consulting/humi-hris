import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\RecruitmentController::store
* @see app/Http/Controllers/Hris/RecruitmentController.php:228
* @route '/hris/recruitment/vacancies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/recruitment/vacancies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::store
* @see app/Http/Controllers/Hris/RecruitmentController.php:228
* @route '/hris/recruitment/vacancies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::store
* @see app/Http/Controllers/Hris/RecruitmentController.php:228
* @route '/hris/recruitment/vacancies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::store
* @see app/Http/Controllers/Hris/RecruitmentController.php:228
* @route '/hris/recruitment/vacancies'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::store
* @see app/Http/Controllers/Hris/RecruitmentController.php:228
* @route '/hris/recruitment/vacancies'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:246
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
export const update = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/recruitment/vacancies/{jobVacancy}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:246
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
update.url = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { jobVacancy: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { jobVacancy: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            jobVacancy: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        jobVacancy: typeof args.jobVacancy === 'object'
        ? args.jobVacancy.id
        : args.jobVacancy,
    }

    return update.definition.url
            .replace('{jobVacancy}', parsedArgs.jobVacancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:246
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
update.put = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:246
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
const updateForm = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:246
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
updateForm.put = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\RecruitmentController::destroy
* @see app/Http/Controllers/Hris/RecruitmentController.php:276
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
export const destroy = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/recruitment/vacancies/{jobVacancy}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::destroy
* @see app/Http/Controllers/Hris/RecruitmentController.php:276
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
destroy.url = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { jobVacancy: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { jobVacancy: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            jobVacancy: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        jobVacancy: typeof args.jobVacancy === 'object'
        ? args.jobVacancy.id
        : args.jobVacancy,
    }

    return destroy.definition.url
            .replace('{jobVacancy}', parsedArgs.jobVacancy.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::destroy
* @see app/Http/Controllers/Hris/RecruitmentController.php:276
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
destroy.delete = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::destroy
* @see app/Http/Controllers/Hris/RecruitmentController.php:276
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
const destroyForm = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::destroy
* @see app/Http/Controllers/Hris/RecruitmentController.php:276
* @route '/hris/recruitment/vacancies/{jobVacancy}'
*/
destroyForm.delete = (args: { jobVacancy: number | { id: number } } | [jobVacancy: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const vacancies = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default vacancies