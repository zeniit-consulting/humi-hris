import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import bankAccounts from './bank-accounts'
import documents from './documents'
import allowances from './allowances'
/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:42
* @route '/hris/employees'
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
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
export const masterData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: masterData.url(options),
    method: 'get',
})

masterData.definition = {
    methods: ["get","head"],
    url: '/hris/employees/master-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
masterData.url = (options?: RouteQueryOptions) => {
    return masterData.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
masterData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: masterData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
masterData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: masterData.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
const masterDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: masterData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
masterDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: masterData.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeMasterController::masterData
* @see app/Http/Controllers/Hris/EmployeeMasterController.php:18
* @route '/hris/employees/master-data'
*/
masterDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: masterData.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

masterData.form = masterDataForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
export const importTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

importTemplate.definition = {
    methods: ["get","head"],
    url: '/hris/employees/import-template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
importTemplate.url = (options?: RouteQueryOptions) => {
    return importTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
importTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
importTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: importTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
const importTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
importTemplateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:506
* @route '/hris/employees/import-template'
*/
importTemplateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: importTemplate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

importTemplate.form = importTemplateForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:561
* @route '/hris/employees/import'
*/
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/hris/employees/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:561
* @route '/hris/employees/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:561
* @route '/hris/employees/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:561
* @route '/hris/employees/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:561
* @route '/hris/employees/import'
*/
importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

importMethod.form = importMethodForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/hris/employees/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:431
* @route '/hris/employees/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
export const contract = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contract.url(args, options),
    method: 'get',
})

contract.definition = {
    methods: ["get","head"],
    url: '/hris/employees/{employee}/contract',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
contract.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return contract.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
contract.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
contract.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contract.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
const contractForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
contractForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:765
* @route '/hris/employees/{employee}/contract'
*/
contractForm.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contract.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

contract.form = contractForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activateUser
* @see app/Http/Controllers/Hris/EmployeeController.php:890
* @route '/hris/employees/{employee}/activate-user'
*/
export const activateUser = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activateUser.url(args, options),
    method: 'post',
})

activateUser.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/activate-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activateUser
* @see app/Http/Controllers/Hris/EmployeeController.php:890
* @route '/hris/employees/{employee}/activate-user'
*/
activateUser.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return activateUser.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activateUser
* @see app/Http/Controllers/Hris/EmployeeController.php:890
* @route '/hris/employees/{employee}/activate-user'
*/
activateUser.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activateUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activateUser
* @see app/Http/Controllers/Hris/EmployeeController.php:890
* @route '/hris/employees/{employee}/activate-user'
*/
const activateUserForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activateUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activateUser
* @see app/Http/Controllers/Hris/EmployeeController.php:890
* @route '/hris/employees/{employee}/activate-user'
*/
activateUserForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activateUser.url(args, options),
    method: 'post',
})

activateUser.form = activateUserForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:911
* @route '/hris/employees/{employee}/offboard'
*/
export const offboard = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: offboard.url(args, options),
    method: 'post',
})

offboard.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/offboard',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:911
* @route '/hris/employees/{employee}/offboard'
*/
offboard.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return offboard.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:911
* @route '/hris/employees/{employee}/offboard'
*/
offboard.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: offboard.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:911
* @route '/hris/employees/{employee}/offboard'
*/
const offboardForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: offboard.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:911
* @route '/hris/employees/{employee}/offboard'
*/
offboardForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: offboard.url(args, options),
    method: 'post',
})

offboard.form = offboardForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:816
* @route '/hris/employees'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:816
* @route '/hris/employees'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:816
* @route '/hris/employees'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:816
* @route '/hris/employees'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:816
* @route '/hris/employees'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:863
* @route '/hris/employees/{employee}'
*/
export const update = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/employees/{employee}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:863
* @route '/hris/employees/{employee}'
*/
update.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:863
* @route '/hris/employees/{employee}'
*/
update.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:863
* @route '/hris/employees/{employee}'
*/
const updateForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:863
* @route '/hris/employees/{employee}'
*/
updateForm.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:959
* @route '/hris/employees/{employee}'
*/
export const destroy = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/employees/{employee}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:959
* @route '/hris/employees/{employee}'
*/
destroy.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:959
* @route '/hris/employees/{employee}'
*/
destroy.delete = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:959
* @route '/hris/employees/{employee}'
*/
const destroyForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:959
* @route '/hris/employees/{employee}'
*/
destroyForm.delete = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const employees = {
    index: Object.assign(index, index),
    masterData: Object.assign(masterData, masterData),
    importTemplate: Object.assign(importTemplate, importTemplate),
    import: Object.assign(importMethod, importMethod),
    export: Object.assign(exportMethod, exportMethod),
    contract: Object.assign(contract, contract),
    activateUser: Object.assign(activateUser, activateUser),
    offboard: Object.assign(offboard, offboard),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
    bankAccounts: Object.assign(bankAccounts, bankAccounts),
    documents: Object.assign(documents, documents),
    allowances: Object.assign(allowances, allowances),
}

export default employees