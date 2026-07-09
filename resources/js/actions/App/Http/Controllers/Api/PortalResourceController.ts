import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
export const announcements = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(options),
    method: 'get',
})

announcements.definition = {
    methods: ["get","head"],
    url: '/portal/api/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
announcements.url = (options?: RouteQueryOptions) => {
    return announcements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
announcements.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
announcements.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: announcements.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
const announcementsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
announcementsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::announcements
* @see app/Http/Controllers/Api/PortalResourceController.php:21
* @route '/portal/api/announcements'
*/
announcementsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

announcements.form = announcementsForm

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
export const surveys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: surveys.url(options),
    method: 'get',
})

surveys.definition = {
    methods: ["get","head"],
    url: '/portal/api/surveys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
surveys.url = (options?: RouteQueryOptions) => {
    return surveys.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
surveys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
surveys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: surveys.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
const surveysForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
surveysForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::surveys
* @see app/Http/Controllers/Api/PortalResourceController.php:65
* @route '/portal/api/surveys'
*/
surveysForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

surveys.form = surveysForm

/**
* @see \App\Http\Controllers\Api\PortalResourceController::submitSurvey
* @see app/Http/Controllers/Api/PortalResourceController.php:120
* @route '/portal/api/surveys/{survey}/responses'
*/
export const submitSurvey = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitSurvey.url(args, options),
    method: 'post',
})

submitSurvey.definition = {
    methods: ["post"],
    url: '/portal/api/surveys/{survey}/responses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::submitSurvey
* @see app/Http/Controllers/Api/PortalResourceController.php:120
* @route '/portal/api/surveys/{survey}/responses'
*/
submitSurvey.url = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return submitSurvey.definition.url
            .replace('{survey}', parsedArgs.survey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::submitSurvey
* @see app/Http/Controllers/Api/PortalResourceController.php:120
* @route '/portal/api/surveys/{survey}/responses'
*/
submitSurvey.post = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submitSurvey.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::submitSurvey
* @see app/Http/Controllers/Api/PortalResourceController.php:120
* @route '/portal/api/surveys/{survey}/responses'
*/
const submitSurveyForm = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: submitSurvey.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::submitSurvey
* @see app/Http/Controllers/Api/PortalResourceController.php:120
* @route '/portal/api/surveys/{survey}/responses'
*/
submitSurveyForm.post = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: submitSurvey.url(args, options),
    method: 'post',
})

submitSurvey.form = submitSurveyForm

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
export const assets = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assets.url(options),
    method: 'get',
})

assets.definition = {
    methods: ["get","head"],
    url: '/portal/api/assets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
assets.url = (options?: RouteQueryOptions) => {
    return assets.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
assets.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
assets.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: assets.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
const assetsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
assetsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::assets
* @see app/Http/Controllers/Api/PortalResourceController.php:148
* @route '/portal/api/assets'
*/
assetsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

assets.form = assetsForm

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
export const reprimands = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reprimands.url(options),
    method: 'get',
})

reprimands.definition = {
    methods: ["get","head"],
    url: '/portal/api/reprimands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
reprimands.url = (options?: RouteQueryOptions) => {
    return reprimands.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
reprimands.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
reprimands.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reprimands.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
const reprimandsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
reprimandsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalResourceController::reprimands
* @see app/Http/Controllers/Api/PortalResourceController.php:186
* @route '/portal/api/reprimands'
*/
reprimandsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reprimands.form = reprimandsForm

const PortalResourceController = { announcements, surveys, submitSurvey, assets, reprimands }

export default PortalResourceController