import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::store
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:17
* @route '/hris/employees/{employee}/bank-accounts'
*/
export const store = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/bank-accounts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::store
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:17
* @route '/hris/employees/{employee}/bank-accounts'
*/
store.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::store
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:17
* @route '/hris/employees/{employee}/bank-accounts'
*/
store.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::store
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:17
* @route '/hris/employees/{employee}/bank-accounts'
*/
const storeForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::store
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:17
* @route '/hris/employees/{employee}/bank-accounts'
*/
storeForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::update
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:41
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
export const update = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::update
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:41
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
update.url = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeBankAccount: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeBankAccount: typeof args.employeeBankAccount === 'object'
        ? args.employeeBankAccount.id
        : args.employeeBankAccount,
    }

    return update.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeBankAccount}', parsedArgs.employeeBankAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::update
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:41
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
update.put = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::update
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:41
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
const updateForm = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::update
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:41
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
updateForm.put = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::destroy
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:72
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
export const destroy = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::destroy
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:72
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
destroy.url = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeBankAccount: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeBankAccount: typeof args.employeeBankAccount === 'object'
        ? args.employeeBankAccount.id
        : args.employeeBankAccount,
    }

    return destroy.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeBankAccount}', parsedArgs.employeeBankAccount.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::destroy
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:72
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
destroy.delete = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::destroy
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:72
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
const destroyForm = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeBankAccountController::destroy
* @see app/Http/Controllers/Hris/EmployeeBankAccountController.php:72
* @route '/hris/employees/{employee}/bank-accounts/{employeeBankAccount}'
*/
destroyForm.delete = (args: { employee: number | { id: number }, employeeBankAccount: number | { id: number } } | [employee: number | { id: number }, employeeBankAccount: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const EmployeeBankAccountController = { store, update, destroy }

export default EmployeeBankAccountController