import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import periods from './periods'
import templates from './templates'
import metrics from './metrics'
import reviews from './reviews'
import objectives from './objectives'
import keyResults from './key-results'
import kpiResults from './kpi-results'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/performances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
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

const performances = {
    index: Object.assign(index, index),
    periods: Object.assign(periods, periods),
    templates: Object.assign(templates, templates),
    metrics: Object.assign(metrics, metrics),
    reviews: Object.assign(reviews, reviews),
    objectives: Object.assign(objectives, objectives),
    keyResults: Object.assign(keyResults, keyResults),
    kpiResults: Object.assign(kpiResults, kpiResults),
}

export default performances