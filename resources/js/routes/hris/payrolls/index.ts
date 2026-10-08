import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import thr from './thr'
import items from './items'
import exportMethod9280c6 from './export'
/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
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
* @see app/Http/Controllers/Hris/PayrollController.php:34
* @route '/hris/payrolls'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
* @route '/hris/payrolls'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
* @route '/hris/payrolls'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
* @route '/hris/payrolls'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
* @route '/hris/payrolls'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::index
* @see app/Http/Controllers/Hris/PayrollController.php:34
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
* @see app/Http/Controllers/Hris/PayrollController.php:233
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
* @see app/Http/Controllers/Hris/PayrollController.php:233
* @route '/hris/payrolls/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:233
* @route '/hris/payrolls/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:233
* @route '/hris/payrolls/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:233
* @route '/hris/payrolls/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::lock
* @see app/Http/Controllers/Hris/PayrollController.php:347
* @route '/hris/payrolls/{payrollRun}/lock'
*/
export const lock = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

lock.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/lock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::lock
* @see app/Http/Controllers/Hris/PayrollController.php:347
* @route '/hris/payrolls/{payrollRun}/lock'
*/
lock.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return lock.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::lock
* @see app/Http/Controllers/Hris/PayrollController.php:347
* @route '/hris/payrolls/{payrollRun}/lock'
*/
lock.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: lock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::lock
* @see app/Http/Controllers/Hris/PayrollController.php:347
* @route '/hris/payrolls/{payrollRun}/lock'
*/
const lockForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::lock
* @see app/Http/Controllers/Hris/PayrollController.php:347
* @route '/hris/payrolls/{payrollRun}/lock'
*/
lockForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: lock.url(args, options),
    method: 'post',
})

lock.form = lockForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:277
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
* @see app/Http/Controllers/Hris/PayrollController.php:277
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
* @see app/Http/Controllers/Hris/PayrollController.php:277
* @route '/hris/payrolls/{payrollRun}/save'
*/
save.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:277
* @route '/hris/payrolls/{payrollRun}/save'
*/
const saveForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:277
* @route '/hris/payrolls/{payrollRun}/save'
*/
saveForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

save.form = saveForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::release
* @see app/Http/Controllers/Hris/PayrollController.php:308
* @route '/hris/payrolls/{payrollRun}/release'
*/
export const release = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

release.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/release',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::release
* @see app/Http/Controllers/Hris/PayrollController.php:308
* @route '/hris/payrolls/{payrollRun}/release'
*/
release.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return release.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::release
* @see app/Http/Controllers/Hris/PayrollController.php:308
* @route '/hris/payrolls/{payrollRun}/release'
*/
release.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::release
* @see app/Http/Controllers/Hris/PayrollController.php:308
* @route '/hris/payrolls/{payrollRun}/release'
*/
const releaseForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: release.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::release
* @see app/Http/Controllers/Hris/PayrollController.php:308
* @route '/hris/payrolls/{payrollRun}/release'
*/
releaseForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: release.url(args, options),
    method: 'post',
})

release.form = releaseForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1485
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
* @see app/Http/Controllers/Hris/PayrollController.php:1485
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
* @see app/Http/Controllers/Hris/PayrollController.php:1485
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslips.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1485
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
const sendPayslipsForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1485
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslipsForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

sendPayslips.form = sendPayslipsForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
export const exportMethod = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportMethod.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportMethod.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportMethod.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
const exportMethodForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportMethodForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMethod
* @see app/Http/Controllers/Hris/PayrollController.php:676
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportMethodForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

const payrolls = {
    index: Object.assign(index, index),
    generate: Object.assign(generate, generate),
    thr: Object.assign(thr, thr),
    lock: Object.assign(lock, lock),
    save: Object.assign(save, save),
    release: Object.assign(release, release),
    sendPayslips: Object.assign(sendPayslips, sendPayslips),
    items: Object.assign(items, items),
    export: Object.assign(exportMethod, exportMethod9280c6),
}

export default payrolls