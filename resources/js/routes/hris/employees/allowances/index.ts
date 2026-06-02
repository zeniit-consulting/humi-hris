import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::store
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:17
* @route '/hris/employees/{employee}/allowances'
*/
export const store = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/allowances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::store
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:17
* @route '/hris/employees/{employee}/allowances'
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
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::store
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:17
* @route '/hris/employees/{employee}/allowances'
*/
store.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::store
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:17
* @route '/hris/employees/{employee}/allowances'
*/
const storeForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::store
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:17
* @route '/hris/employees/{employee}/allowances'
*/
storeForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::update
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:32
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
export const update = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/employees/{employee}/allowances/{employeeAllowance}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::update
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:32
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
update.url = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeAllowance: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeAllowance: typeof args.employeeAllowance === 'object'
        ? args.employeeAllowance.id
        : args.employeeAllowance,
    }

    return update.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeAllowance}', parsedArgs.employeeAllowance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::update
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:32
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
update.put = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::update
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:32
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
const updateForm = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::update
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:32
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
updateForm.put = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::destroy
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:52
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
export const destroy = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/employees/{employee}/allowances/{employeeAllowance}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::destroy
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:52
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
destroy.url = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeAllowance: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeAllowance: typeof args.employeeAllowance === 'object'
        ? args.employeeAllowance.id
        : args.employeeAllowance,
    }

    return destroy.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeAllowance}', parsedArgs.employeeAllowance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::destroy
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:52
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
destroy.delete = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::destroy
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:52
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
const destroyForm = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeAllowanceController::destroy
* @see app/Http/Controllers/Hris/EmployeeAllowanceController.php:52
* @route '/hris/employees/{employee}/allowances/{employeeAllowance}'
*/
destroyForm.delete = (args: { employee: number | { id: number }, employeeAllowance: number | { id: number } } | [employee: number | { id: number }, employeeAllowance: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const allowances = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default allowances