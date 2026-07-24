import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/leaves/balances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::index
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:22
* @route '/hris/leaves/balances'
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
* @see \App\Http\Controllers\Hris\LeaveBalanceController::initialize
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:117
* @route '/hris/leaves/balances/initialize'
*/
export const initialize = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

initialize.definition = {
    methods: ["post"],
    url: '/hris/leaves/balances/initialize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::initialize
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:117
* @route '/hris/leaves/balances/initialize'
*/
initialize.url = (options?: RouteQueryOptions) => {
    return initialize.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::initialize
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:117
* @route '/hris/leaves/balances/initialize'
*/
initialize.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: initialize.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::initialize
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:117
* @route '/hris/leaves/balances/initialize'
*/
const initializeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: initialize.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::initialize
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:117
* @route '/hris/leaves/balances/initialize'
*/
initializeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: initialize.url(options),
    method: 'post',
})

initialize.form = initializeForm

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::accrue
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:139
* @route '/hris/leaves/balances/accrue'
*/
export const accrue = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accrue.url(options),
    method: 'post',
})

accrue.definition = {
    methods: ["post"],
    url: '/hris/leaves/balances/accrue',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::accrue
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:139
* @route '/hris/leaves/balances/accrue'
*/
accrue.url = (options?: RouteQueryOptions) => {
    return accrue.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::accrue
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:139
* @route '/hris/leaves/balances/accrue'
*/
accrue.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accrue.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::accrue
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:139
* @route '/hris/leaves/balances/accrue'
*/
const accrueForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accrue.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::accrue
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:139
* @route '/hris/leaves/balances/accrue'
*/
accrueForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accrue.url(options),
    method: 'post',
})

accrue.form = accrueForm

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::adjust
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:159
* @route '/hris/leaves/balances/{employee}/adjust'
*/
export const adjust = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: adjust.url(args, options),
    method: 'put',
})

adjust.definition = {
    methods: ["put"],
    url: '/hris/leaves/balances/{employee}/adjust',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::adjust
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:159
* @route '/hris/leaves/balances/{employee}/adjust'
*/
adjust.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return adjust.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::adjust
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:159
* @route '/hris/leaves/balances/{employee}/adjust'
*/
adjust.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: adjust.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::adjust
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:159
* @route '/hris/leaves/balances/{employee}/adjust'
*/
const adjustForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::adjust
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:159
* @route '/hris/leaves/balances/{employee}/adjust'
*/
adjustForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: adjust.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

adjust.form = adjustForm

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
export const ledger = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ledger.url(args, options),
    method: 'get',
})

ledger.definition = {
    methods: ["get","head"],
    url: '/hris/leaves/balances/{employee}/ledger',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
ledger.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employee: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employee: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employee: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
    }

    return ledger.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
ledger.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ledger.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
ledger.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ledger.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
const ledgerForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ledger.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
ledgerForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ledger.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\LeaveBalanceController::ledger
* @see app/Http/Controllers/Hris/LeaveBalanceController.php:184
* @route '/hris/leaves/balances/{employee}/ledger'
*/
ledgerForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ledger.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ledger.form = ledgerForm

const LeaveBalanceController = { index, initialize, accrue, adjust, ledger }

export default LeaveBalanceController