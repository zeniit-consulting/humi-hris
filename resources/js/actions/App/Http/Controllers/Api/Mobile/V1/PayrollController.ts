import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
const preview735797829951a6e770e4f08a80d49761 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview735797829951a6e770e4f08a80d49761.url(options),
    method: 'get',
})

preview735797829951a6e770e4f08a80d49761.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/payrolls/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
preview735797829951a6e770e4f08a80d49761.url = (options?: RouteQueryOptions) => {
    return preview735797829951a6e770e4f08a80d49761.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
preview735797829951a6e770e4f08a80d49761.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: preview735797829951a6e770e4f08a80d49761.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
preview735797829951a6e770e4f08a80d49761.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: preview735797829951a6e770e4f08a80d49761.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
const preview735797829951a6e770e4f08a80d49761Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview735797829951a6e770e4f08a80d49761.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
preview735797829951a6e770e4f08a80d49761Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview735797829951a6e770e4f08a80d49761.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/api/mobile/v1/payrolls/preview'
*/
preview735797829951a6e770e4f08a80d49761Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: preview735797829951a6e770e4f08a80d49761.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

preview735797829951a6e770e4f08a80d49761.form = preview735797829951a6e770e4f08a80d49761Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
const previewcd783b4a2eabe361314bcba06d5ab5f3 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: previewcd783b4a2eabe361314bcba06d5ab5f3.url(options),
    method: 'get',
})

previewcd783b4a2eabe361314bcba06d5ab5f3.definition = {
    methods: ["get","head"],
    url: '/portal/api/payrolls/preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewcd783b4a2eabe361314bcba06d5ab5f3.url = (options?: RouteQueryOptions) => {
    return previewcd783b4a2eabe361314bcba06d5ab5f3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewcd783b4a2eabe361314bcba06d5ab5f3.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: previewcd783b4a2eabe361314bcba06d5ab5f3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewcd783b4a2eabe361314bcba06d5ab5f3.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: previewcd783b4a2eabe361314bcba06d5ab5f3.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
const previewcd783b4a2eabe361314bcba06d5ab5f3Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewcd783b4a2eabe361314bcba06d5ab5f3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewcd783b4a2eabe361314bcba06d5ab5f3Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewcd783b4a2eabe361314bcba06d5ab5f3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::preview
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:20
* @route '/portal/api/payrolls/preview'
*/
previewcd783b4a2eabe361314bcba06d5ab5f3Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewcd783b4a2eabe361314bcba06d5ab5f3.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

previewcd783b4a2eabe361314bcba06d5ab5f3.form = previewcd783b4a2eabe361314bcba06d5ab5f3Form

export const preview = {
    '/api/mobile/v1/payrolls/preview': preview735797829951a6e770e4f08a80d49761,
    '/portal/api/payrolls/preview': previewcd783b4a2eabe361314bcba06d5ab5f3,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::generate
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:37
* @route '/api/mobile/v1/payrolls/generate'
*/
export const generate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

generate.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/payrolls/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::generate
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:37
* @route '/api/mobile/v1/payrolls/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::generate
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:37
* @route '/api/mobile/v1/payrolls/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::generate
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:37
* @route '/api/mobile/v1/payrolls/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::generate
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:37
* @route '/api/mobile/v1/payrolls/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::save
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:48
* @route '/api/mobile/v1/payrolls/{payrollRun}/save'
*/
export const save = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

save.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/payrolls/{payrollRun}/save',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::save
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:48
* @route '/api/mobile/v1/payrolls/{payrollRun}/save'
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
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::save
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:48
* @route '/api/mobile/v1/payrolls/{payrollRun}/save'
*/
save.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::save
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:48
* @route '/api/mobile/v1/payrolls/{payrollRun}/save'
*/
const saveForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::save
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:48
* @route '/api/mobile/v1/payrolls/{payrollRun}/save'
*/
saveForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

save.form = saveForm

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/payrolls/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PayrollController::history
* @see app/Http/Controllers/Api/Mobile/V1/PayrollController.php:64
* @route '/api/mobile/v1/payrolls/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

const PayrollController = { preview, generate, save, history }

export default PayrollController