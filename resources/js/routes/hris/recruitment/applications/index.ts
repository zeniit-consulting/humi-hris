import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
export const update = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/recruitment/applications/{jobApplication}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
update.url = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{jobApplication}', parsedArgs.jobApplication.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
update.put = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\RecruitmentController::update
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
const updateForm = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/RecruitmentController.php:294
* @route '/hris/recruitment/applications/{jobApplication}'
*/
updateForm.put = (args: { jobApplication: number | { id: number } } | [jobApplication: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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

const applications = {
    update: Object.assign(update, update),
    offerLetter: Object.assign(offerLetter, offerLetter),
    initialContract: Object.assign(initialContract, initialContract),
}

export default applications