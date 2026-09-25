import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
* @see app/Http/Controllers/Hris/PayrollController.php:210
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
* @see app/Http/Controllers/Hris/PayrollController.php:210
* @route '/hris/payrolls/generate'
*/
generate.url = (options?: RouteQueryOptions) => {
    return generate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:210
* @route '/hris/payrolls/generate'
*/
generate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:210
* @route '/hris/payrolls/generate'
*/
const generateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generate
* @see app/Http/Controllers/Hris/PayrollController.php:210
* @route '/hris/payrolls/generate'
*/
generateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generate.url(options),
    method: 'post',
})

generate.form = generateForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::generateThr
* @see app/Http/Controllers/Hris/PayrollController.php:238
* @route '/hris/payrolls/thr/generate'
*/
export const generateThr = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateThr.url(options),
    method: 'post',
})

generateThr.definition = {
    methods: ["post"],
    url: '/hris/payrolls/thr/generate',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::generateThr
* @see app/Http/Controllers/Hris/PayrollController.php:238
* @route '/hris/payrolls/thr/generate'
*/
generateThr.url = (options?: RouteQueryOptions) => {
    return generateThr.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::generateThr
* @see app/Http/Controllers/Hris/PayrollController.php:238
* @route '/hris/payrolls/thr/generate'
*/
generateThr.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: generateThr.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generateThr
* @see app/Http/Controllers/Hris/PayrollController.php:238
* @route '/hris/payrolls/thr/generate'
*/
const generateThrForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generateThr.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::generateThr
* @see app/Http/Controllers/Hris/PayrollController.php:238
* @route '/hris/payrolls/thr/generate'
*/
generateThrForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: generateThr.url(options),
    method: 'post',
})

generateThr.form = generateThrForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::toggleLock
* @see app/Http/Controllers/Hris/PayrollController.php:282
* @route '/hris/payrolls/{payrollRun}/lock'
*/
export const toggleLock = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleLock.url(args, options),
    method: 'post',
})

toggleLock.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/lock',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::toggleLock
* @see app/Http/Controllers/Hris/PayrollController.php:282
* @route '/hris/payrolls/{payrollRun}/lock'
*/
toggleLock.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return toggleLock.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::toggleLock
* @see app/Http/Controllers/Hris/PayrollController.php:282
* @route '/hris/payrolls/{payrollRun}/lock'
*/
toggleLock.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleLock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::toggleLock
* @see app/Http/Controllers/Hris/PayrollController.php:282
* @route '/hris/payrolls/{payrollRun}/lock'
*/
const toggleLockForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleLock.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::toggleLock
* @see app/Http/Controllers/Hris/PayrollController.php:282
* @route '/hris/payrolls/{payrollRun}/lock'
*/
toggleLockForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleLock.url(args, options),
    method: 'post',
})

toggleLock.form = toggleLockForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:254
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
* @see app/Http/Controllers/Hris/PayrollController.php:254
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
* @see app/Http/Controllers/Hris/PayrollController.php:254
* @route '/hris/payrolls/{payrollRun}/save'
*/
save.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:254
* @route '/hris/payrolls/{payrollRun}/save'
*/
const saveForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::save
* @see app/Http/Controllers/Hris/PayrollController.php:254
* @route '/hris/payrolls/{payrollRun}/save'
*/
saveForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: save.url(args, options),
    method: 'post',
})

save.form = saveForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1221
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
* @see app/Http/Controllers/Hris/PayrollController.php:1221
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
* @see app/Http/Controllers/Hris/PayrollController.php:1221
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslips.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1221
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
const sendPayslipsForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslips
* @see app/Http/Controllers/Hris/PayrollController.php:1221
* @route '/hris/payrolls/{payrollRun}/send-payslips'
*/
sendPayslipsForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslips.url(args, options),
    method: 'post',
})

sendPayslips.form = sendPayslipsForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::updateItem
* @see app/Http/Controllers/Hris/PayrollController.php:338
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
export const updateItem = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItem.url(args, options),
    method: 'put',
})

updateItem.definition = {
    methods: ["put"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::updateItem
* @see app/Http/Controllers/Hris/PayrollController.php:338
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
updateItem.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            payrollRun: args[0],
            payrollItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payrollRun: typeof args.payrollRun === 'object'
        ? args.payrollRun.id
        : args.payrollRun,
        payrollItem: typeof args.payrollItem === 'object'
        ? args.payrollItem.id
        : args.payrollItem,
    }

    return updateItem.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::updateItem
* @see app/Http/Controllers/Hris/PayrollController.php:338
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
updateItem.put = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateItem.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::updateItem
* @see app/Http/Controllers/Hris/PayrollController.php:338
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
const updateItemForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::updateItem
* @see app/Http/Controllers/Hris/PayrollController.php:338
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
updateItemForm.put = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateItem.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateItem.form = updateItemForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1265
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
export const sendPayslip = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslip.url(args, options),
    method: 'post',
})

sendPayslip.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1265
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslip.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            payrollRun: args[0],
            payrollItem: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payrollRun: typeof args.payrollRun === 'object'
        ? args.payrollRun.id
        : args.payrollRun,
        payrollItem: typeof args.payrollItem === 'object'
        ? args.payrollItem.id
        : args.payrollItem,
    }

    return sendPayslip.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1265
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslip.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1265
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
const sendPayslipForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1265
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslipForm.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

sendPayslip.form = sendPayslipForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
const exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, options),
    method: 'get',
})

exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
const exportCsvc34e74b6fe7b735e5bd3cee997e8ffbdForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportCsvc34e74b6fe7b735e5bd3cee997e8ffbdForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export'
*/
exportCsvc34e74b6fe7b735e5bd3cee997e8ffbdForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd.form = exportCsvc34e74b6fe7b735e5bd3cee997e8ffbdForm
/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
const exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, options),
    method: 'get',
})

exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
const exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbcForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbcForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportCsv
* @see app/Http/Controllers/Hris/PayrollController.php:477
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbcForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc.form = exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbcForm

export const exportCsv = {
    '/hris/payrolls/{payrollRun}/export': exportCsvc34e74b6fe7b735e5bd3cee997e8ffbd,
    '/hris/payrolls/{payrollRun}/export/csv': exportCsveb2f51aa14dea4dfb0b9a2b4f3494dbc,
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
const exportExcelfe452480f2250a3cc09524f3d93e8fbc = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, options),
    method: 'get',
})

exportExcelfe452480f2250a3cc09524f3d93e8fbc.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/excel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
exportExcelfe452480f2250a3cc09524f3d93e8fbc.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportExcelfe452480f2250a3cc09524f3d93e8fbc.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
exportExcelfe452480f2250a3cc09524f3d93e8fbc.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
exportExcelfe452480f2250a3cc09524f3d93e8fbc.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
const exportExcelfe452480f2250a3cc09524f3d93e8fbcForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
exportExcelfe452480f2250a3cc09524f3d93e8fbcForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/excel'
*/
exportExcelfe452480f2250a3cc09524f3d93e8fbcForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelfe452480f2250a3cc09524f3d93e8fbc.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportExcelfe452480f2250a3cc09524f3d93e8fbc.form = exportExcelfe452480f2250a3cc09524f3d93e8fbcForm
/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
const exportExcelbb171311683adde9bc6a9c86bb82934c = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, options),
    method: 'get',
})

exportExcelbb171311683adde9bc6a9c86bb82934c.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/xlsx',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
exportExcelbb171311683adde9bc6a9c86bb82934c.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportExcelbb171311683adde9bc6a9c86bb82934c.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
exportExcelbb171311683adde9bc6a9c86bb82934c.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
exportExcelbb171311683adde9bc6a9c86bb82934c.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
const exportExcelbb171311683adde9bc6a9c86bb82934cForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
exportExcelbb171311683adde9bc6a9c86bb82934cForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportExcel
* @see app/Http/Controllers/Hris/PayrollController.php:794
* @route '/hris/payrolls/{payrollRun}/export/xlsx'
*/
exportExcelbb171311683adde9bc6a9c86bb82934cForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportExcelbb171311683adde9bc6a9c86bb82934c.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportExcelbb171311683adde9bc6a9c86bb82934c.form = exportExcelbb171311683adde9bc6a9c86bb82934cForm

export const exportExcel = {
    '/hris/payrolls/{payrollRun}/export/excel': exportExcelfe452480f2250a3cc09524f3d93e8fbc,
    '/hris/payrolls/{payrollRun}/export/xlsx': exportExcelbb171311683adde9bc6a9c86bb82934c,
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
export const exportMandiri = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMandiri.url(args, options),
    method: 'get',
})

exportMandiri.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/mandiri',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
exportMandiri.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportMandiri.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
exportMandiri.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
exportMandiri.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMandiri.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
const exportMandiriForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
exportMandiriForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportMandiri
* @see app/Http/Controllers/Hris/PayrollController.php:1039
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
exportMandiriForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMandiri.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMandiri.form = exportMandiriForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
export const exportBca = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportBca.url(args, options),
    method: 'get',
})

exportBca.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/bca',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
exportBca.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return exportBca.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
exportBca.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportBca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
exportBca.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportBca.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
const exportBcaForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportBca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
exportBcaForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportBca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::exportBca
* @see app/Http/Controllers/Hris/PayrollController.php:1180
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
exportBcaForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportBca.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportBca.form = exportBcaForm

const PayrollController = { index, generate, generateThr, toggleLock, save, sendPayslips, updateItem, sendPayslip, exportCsv, exportExcel, exportMandiri, exportBca }

export default PayrollController