import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import thr from './thr'
import items from './items'
import exportMethod from './export'
/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:28
* @route '/hris/payrolls'
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
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:157
* @route '/hris/payrolls/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/hris/payrolls/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:157
* @route '/hris/payrolls/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:157
* @route '/hris/payrolls/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:157
* @route '/hris/payrolls/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:157
* @route '/hris/payrolls/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:195
* @route '/hris/payrolls/{payrollRun}/save'
*/
export const save = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

save.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/save',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:195
* @route '/hris/payrolls/{payrollRun}/save'
*/
save.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollRun: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { payrollRun: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            payrollRun: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payrollRun: typeof args.payrollRun === 'object'
        ? args.payrollRun.id
        : args.payrollRun,
    }

    return save.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:195
* @route '/hris/payrolls/{payrollRun}/save'
*/
save.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:195
* @route '/hris/payrolls/{payrollRun}/save'
*/
const saveForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:195
* @route '/hris/payrolls/{payrollRun}/save'
*/
saveForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

save.form = saveForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
export const sendPayslips = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslips.url(args, options),
    method: 'post',
})

sendPayslips.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/send-payslips',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslips.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payrollRun: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { payrollRun: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            payrollRun: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payrollRun: typeof args.payrollRun === 'object'
        ? args.payrollRun.id
        : args.payrollRun,
    }

    return sendPayslips.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslips.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
const sendPayslipsForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslipsForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

sendPayslips.form = sendPayslipsForm

const payrolls = {
    index: Object.assign(index, index),
    generate: Object.assign(generate, generate),
    thr: Object.assign(thr, thr),
    save: Object.assign(save, save),
    sendPayslips: Object.assign(sendPayslips, sendPayslips),
    items: Object.assign(items, items),
    export: Object.assign(exportMethod, exportMethod),
}

export default payrolls