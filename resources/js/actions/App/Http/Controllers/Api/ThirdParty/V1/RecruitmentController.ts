import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
export const vacancies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vacancies.url(options),
    method: 'get',
})

vacancies.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/vacancies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
vacancies.url = (options?: RouteQueryOptions) => {
    return vacancies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
vacancies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: vacancies.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
vacancies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: vacancies.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
const vacanciesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: vacancies.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
vacanciesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: vacancies.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::vacancies
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:22
* @route '/api/third-party/v1/recruitment/vacancies'
*/
vacanciesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: vacancies.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

vacancies.form = vacanciesForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
export const showVacancy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showVacancy.url(args, options),
    method: 'get',
})

showVacancy.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/vacancies/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showVacancy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showVacancy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showVacancy.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showVacancy.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showVacancy.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showVacancy.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
const showVacancyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showVacancy.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showVacancyForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showVacancy.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:80
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
showVacancyForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showVacancy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showVacancy.form = showVacancyForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::storeVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
export const storeVacancy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeVacancy.url(options),
    method: 'post',
})

storeVacancy.definition = {
    methods: ["post"],
    url: '/api/third-party/v1/recruitment/vacancies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::storeVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
storeVacancy.url = (options?: RouteQueryOptions) => {
    return storeVacancy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::storeVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
storeVacancy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeVacancy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::storeVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
const storeVacancyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeVacancy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::storeVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:126
* @route '/api/third-party/v1/recruitment/vacancies'
*/
storeVacancyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeVacancy.url(options),
    method: 'post',
})

storeVacancy.form = storeVacancyForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
export const updateVacancy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateVacancy.url(args, options),
    method: 'put',
})

updateVacancy.definition = {
    methods: ["put"],
    url: '/api/third-party/v1/recruitment/vacancies/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
updateVacancy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return updateVacancy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
updateVacancy.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateVacancy.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
const updateVacancyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateVacancy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::updateVacancy
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:175
* @route '/api/third-party/v1/recruitment/vacancies/{id}'
*/
updateVacancyForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateVacancy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateVacancy.form = updateVacancyForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
export const applications = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: applications.url(options),
    method: 'get',
})

applications.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/applications',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
applications.url = (options?: RouteQueryOptions) => {
    return applications.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
applications.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: applications.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
applications.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: applications.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
const applicationsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: applications.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
applicationsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: applications.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::applications
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:219
* @route '/api/third-party/v1/recruitment/applications'
*/
applicationsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: applications.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

applications.form = applicationsForm

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
export const showApplication = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showApplication.url(args, options),
    method: 'get',
})

showApplication.definition = {
    methods: ["get","head"],
    url: '/api/third-party/v1/recruitment/applications/{id}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showApplication.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return showApplication.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showApplication.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showApplication.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showApplication.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showApplication.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
const showApplicationForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showApplication.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showApplicationForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showApplication.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ThirdParty\V1\RecruitmentController::showApplication
* @see app/Http/Controllers/Api/ThirdParty/V1/RecruitmentController.php:274
* @route '/api/third-party/v1/recruitment/applications/{id}'
*/
showApplicationForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showApplication.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showApplication.form = showApplicationForm

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

const RecruitmentController = { vacancies, showVacancy, storeVacancy, updateVacancy, applications, showApplication, updateStage }

export default RecruitmentController