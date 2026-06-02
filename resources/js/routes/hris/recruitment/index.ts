import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import vacancies from './vacancies'
import applications from './applications'
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

const recruitment = {
    index: Object.assign(index, index),
    vacancies: Object.assign(vacancies, vacancies),
    applications: Object.assign(applications, applications),
}

export default recruitment