import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/recruitment',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::index
* @see app/Http/Controllers/Hris/RecruitmentController.php:30
* @route '/hris/recruitment'
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

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::updateApplication
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
export const updateApplication = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateApplication.url(args, options),
    method: 'put',
})

updateApplication.definition = {
    methods: ["put"],
    url: '/hris/recruitment/applications/{jobApplication}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::updateApplication
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
updateApplication.url = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { jobApplication: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { jobApplication: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            jobApplication: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        jobApplication: typeof args.jobApplication === 'object'
        ? args.jobApplication.id
        : args.jobApplication,
    }

    return updateApplication.definition.url
            .replace('{jobApplication}', parsedArgs.jobApplication.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::updateApplication
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
updateApplication.put = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateApplication.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::updateApplication
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
const updateApplicationForm = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateApplication.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::updateApplication
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
updateApplicationForm.put = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateApplication.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateApplication.form = updateApplicationForm

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
export const offerLetter = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offerLetter.url(args, options),
    method: 'get',
})

offerLetter.definition = {
    methods: ["get","head"],
    url: '/hris/recruitment/applications/{jobApplication}/offer-letter',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
offerLetter.url = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { jobApplication: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { jobApplication: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            jobApplication: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        jobApplication: typeof args.jobApplication === 'object'
        ? args.jobApplication.id
        : args.jobApplication,
    }

    return offerLetter.definition.url
            .replace('{jobApplication}', parsedArgs.jobApplication.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
offerLetter.get = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: offerLetter.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
offerLetter.head = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: offerLetter.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
const offerLetterForm = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offerLetter.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
offerLetterForm.get = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offerLetter.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::offerLetter
* @see app/Http/Controllers/Hris/RecruitmentController.php:318
* @route '/hris/recruitment/applications/{jobApplication}/offer-letter'
*/
offerLetterForm.head = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: offerLetter.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

offerLetter.form = offerLetterForm

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
export const initialContract = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: initialContract.url(args, options),
    method: 'get',
})

initialContract.definition = {
    methods: ["get","head"],
    url: '/hris/recruitment/applications/{jobApplication}/initial-contract',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
initialContract.url = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { jobApplication: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { jobApplication: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            jobApplication: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        jobApplication: typeof args.jobApplication === 'object'
        ? args.jobApplication.id
        : args.jobApplication,
    }

    return initialContract.definition.url
            .replace('{jobApplication}', parsedArgs.jobApplication.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
initialContract.get = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: initialContract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
initialContract.head = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: initialContract.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
const initialContractForm = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: initialContract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
initialContractForm.get = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: initialContract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::initialContract
* @see app/Http/Controllers/Hris/RecruitmentController.php:351
* @route '/hris/recruitment/applications/{jobApplication}/initial-contract'
*/
initialContractForm.head = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: initialContract.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

initialContract.form = initialContractForm

const RecruitmentController = { index, store, update, destroy, updateApplication, offerLetter, initialContract }

export default RecruitmentController