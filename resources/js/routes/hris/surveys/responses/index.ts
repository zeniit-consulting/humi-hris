import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:89
* @route '/hris/surveys/{survey}/responses'
*/
export const store = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/surveys/{survey}/responses',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:89
* @route '/hris/surveys/{survey}/responses'
*/
store.url = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{survey}', parsedArgs.survey.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:89
* @route '/hris/surveys/{survey}/responses'
*/
store.post = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:89
* @route '/hris/surveys/{survey}/responses'
*/
const storeForm = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SurveyController::store
* @see app/Http/Controllers/Hris/SurveyController.php:89
* @route '/hris/surveys/{survey}/responses'
*/
storeForm.post = (args: { survey: number | { id: number } } | [survey: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

const responses = {
    store: Object.assign(store, store),
}

export default responses