import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:145
* @route '/hris/payrolls/thr/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/hris/payrolls/thr/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:145
* @route '/hris/payrolls/thr/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:145
* @route '/hris/payrolls/thr/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:145
* @route '/hris/payrolls/thr/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:145
* @route '/hris/payrolls/thr/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

const thr = {
    generate: Object.assign(generate, generate),
}

export default thr