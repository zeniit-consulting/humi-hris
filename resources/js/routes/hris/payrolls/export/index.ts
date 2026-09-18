import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
export const csv = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: csv.url(args, options),
    method: 'get',
})

csv.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
csv.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return csv.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
csv.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: csv.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
csv.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: csv.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
const csvForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: csv.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
csvForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: csv.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::csv
* @see app/Http/Controllers/Hris/PayrollController.php:443
* @route '/hris/payrolls/{payrollRun}/export/csv'
*/
csvForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: csv.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

csv.form = csvForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
export const mandiri = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mandiri.url(args, options),
    method: 'get',
})

mandiri.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/mandiri',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
mandiri.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return mandiri.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
mandiri.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
mandiri.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mandiri.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
const mandiriForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
mandiriForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mandiri.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::mandiri
* @see app/Http/Controllers/Hris/PayrollController.php:590
* @route '/hris/payrolls/{payrollRun}/export/mandiri'
*/
mandiriForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mandiri.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

mandiri.form = mandiriForm

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
export const bca = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bca.url(args, options),
    method: 'get',
})

bca.definition = {
    methods: ["get","head"],
    url: '/hris/payrolls/{payrollRun}/export/bca',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
bca.url = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return bca.definition.url
            .replace('{payrollRun}', parsedArgs.payrollRun.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
bca.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: bca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
bca.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: bca.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
const bcaForm = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
bcaForm.get = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bca.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PayrollController::bca
* @see app/Http/Controllers/Hris/PayrollController.php:731
* @route '/hris/payrolls/{payrollRun}/export/bca'
*/
bcaForm.head = (args: { payrollRun: number | { id: number } } | [payrollRun: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: bca.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

bca.form = bcaForm

const exportMethod = {
    csv: Object.assign(csv, csv),
    mandiri: Object.assign(mandiri, mandiri),
    bca: Object.assign(bca, bca),
}

export default exportMethod