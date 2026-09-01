import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
export const template = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: template.url(options),
    method: 'get',
})

template.definition = {
    methods: ["get","head"],
    url: '/hris/schedules/import/template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
template.url = (options?: RouteQueryOptions) => {
    return template.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
template.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
template.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: template.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
const templateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
templateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::template
* @see app/Http/Controllers/Hris/ScheduleController.php:422
* @route '/hris/schedules/import/template'
*/
templateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

template.form = templateForm
