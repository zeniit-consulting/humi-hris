import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PayrollController::destroy
* @see app/Http/Controllers/Hris/PayrollController.php:457
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
export const destroy = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::destroy
* @see app/Http/Controllers/Hris/PayrollController.php:457
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
destroy.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::destroy
* @see app/Http/Controllers/Hris/PayrollController.php:457
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
destroy.delete = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::destroy
* @see app/Http/Controllers/Hris/PayrollController.php:457
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
const destroyForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::destroy
* @see app/Http/Controllers/Hris/PayrollController.php:457
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
destroyForm.delete = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::bulkDestroy
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/items/bulk-delete'
*/
export const bulkDestroy = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/items/bulk-delete',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::bulkDestroy
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/items/bulk-delete'
*/
bulkDestroy.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return bulkDestroy.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::bulkDestroy
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/items/bulk-delete'
*/
bulkDestroy.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bulkDestroy
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/items/bulk-delete'
*/
const bulkDestroyForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bulkDestroy
* @see app/Http/Controllers/Hris/PayrollController.php:489
* @route '/hris/payrolls/{payrollRun}/items/bulk-delete'
*/
bulkDestroyForm.post = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(args, options),
    method: 'post',
})

bulkDestroy.form = bulkDestroyForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::update
* @see app/Http/Controllers/Hris/PayrollController.php:523
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
export const update = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::update
* @see app/Http/Controllers/Hris/PayrollController.php:523
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
update.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::update
* @see app/Http/Controllers/Hris/PayrollController.php:523
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
update.put = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::update
* @see app/Http/Controllers/Hris/PayrollController.php:523
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
const updateForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::update
* @see app/Http/Controllers/Hris/PayrollController.php:523
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}'
*/
updateForm.put = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::revertDenda
* @see app/Http/Controllers/Hris/PayrollController.php:597
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda'
*/
export const revertDenda = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revertDenda.url(args, options),
    method: 'post',
})

revertDenda.definition = {
    methods: ["post"],
    url: '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::revertDenda
* @see app/Http/Controllers/Hris/PayrollController.php:597
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda'
*/
revertDenda.url = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return revertDenda.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace('{payrollItem}', parsedArgs.payrollItem.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::revertDenda
* @see app/Http/Controllers/Hris/PayrollController.php:597
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda'
*/
revertDenda.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: revertDenda.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::revertDenda
* @see app/Http/Controllers/Hris/PayrollController.php:597
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda'
*/
const revertDendaForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revertDenda.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::revertDenda
* @see app/Http/Controllers/Hris/PayrollController.php:597
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/revert-denda'
*/
revertDendaForm.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: revertDenda.url(args, options),
    method: 'post',
})

revertDenda.form = revertDendaForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1546
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
* @see app/Http/Controllers/Hris/PayrollController.php:1546
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
* @see app/Http/Controllers/Hris/PayrollController.php:1546
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslip.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1546
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
const sendPayslipForm = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::sendPayslip
* @see app/Http/Controllers/Hris/PayrollController.php:1546
* @route '/hris/payrolls/{payrollRun}/items/{payrollItem}/send-payslip'
*/
sendPayslipForm.post = (args: { payrollRun: number | { id: number }, payrollItem: number | { id: number } } | [payrollRun: number | { id: number }, payrollItem: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sendPayslip.url(args, options),
    method: 'post',
})

sendPayslip.form = sendPayslipForm

const items = {
    destroy: Object.assign(destroy, destroy),
    bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
    update: Object.assign(update, update),
    revertDenda: Object.assign(revertDenda, revertDenda),
    sendPayslip: Object.assign(sendPayslip, sendPayslip),
}

export default items