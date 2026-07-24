import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
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
* @see app/Http/Controllers/Hris/EmployeeController.php:45
* @route '/hris/employees'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
* @route '/hris/employees'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
* @route '/hris/employees'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
* @route '/hris/employees'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
* @route '/hris/employees'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::index
* @see app/Http/Controllers/Hris/EmployeeController.php:45
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
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
export const resigned = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resigned.url(options),
    method: 'get',
})

resigned.definition = {
    methods: ["get","head"],
    url: '/hris/employees/resigned',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
resigned.url = (options?: RouteQueryOptions) => {
    return resigned.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
resigned.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: resigned.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
resigned.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: resigned.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
const resignedForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: resigned.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
resignedForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: resigned.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::resigned
* @see app/Http/Controllers/Hris/EmployeeController.php:536
* @route '/hris/employees/resigned'
*/
resignedForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: resigned.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

resigned.form = resignedForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
export const downloadImportTemplate = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadImportTemplate.url(options),
    method: 'get',
})

downloadImportTemplate.definition = {
    methods: ["get","head"],
    url: '/hris/employees/import-template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
downloadImportTemplate.url = (options?: RouteQueryOptions) => {
    return downloadImportTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
downloadImportTemplate.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
downloadImportTemplate.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadImportTemplate.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
const downloadImportTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
downloadImportTemplateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadImportTemplate.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::downloadImportTemplate
* @see app/Http/Controllers/Hris/EmployeeController.php:732
* @route '/hris/employees/import-template'
*/
downloadImportTemplateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadImportTemplate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

downloadImportTemplate.form = downloadImportTemplateForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:790
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
* @see app/Http/Controllers/Hris/EmployeeController.php:790
* @route '/hris/employees/import'
*/
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:790
* @route '/hris/employees/import'
*/
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:790
* @route '/hris/employees/import'
*/
const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::importMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:790
* @route '/hris/employees/import'
*/
importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: importMethod.url(options),
    method: 'post',
})

importMethod.form = importMethodForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
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
* @see app/Http/Controllers/Hris/EmployeeController.php:544
* @route '/hris/employees/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
* @route '/hris/employees/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
* @route '/hris/employees/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
* @route '/hris/employees/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
* @route '/hris/employees/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::exportMethod
* @see app/Http/Controllers/Hris/EmployeeController.php:544
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
* @route '/hris/employees/{employee}/contract'
*/
contract.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
* @route '/hris/employees/{employee}/contract'
*/
contract.head = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: contract.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
* @route '/hris/employees/{employee}/contract'
*/
const contractForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
* @route '/hris/employees/{employee}/contract'
*/
contractForm.get = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: contract.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::contract
* @see app/Http/Controllers/Hris/EmployeeController.php:1000
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
* @see \App\Http\Controllers\Hris\EmployeeController::activatePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1213
* @route '/hris/employees/{employee}/activate-user'
*/
export const activatePortalUser = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activatePortalUser.url(args, options),
    method: 'post',
})

activatePortalUser.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/activate-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1213
* @route '/hris/employees/{employee}/activate-user'
*/
activatePortalUser.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return activatePortalUser.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1213
* @route '/hris/employees/{employee}/activate-user'
*/
activatePortalUser.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activatePortalUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1213
* @route '/hris/employees/{employee}/activate-user'
*/
const activatePortalUserForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activatePortalUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1213
* @route '/hris/employees/{employee}/activate-user'
*/
activatePortalUserForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activatePortalUser.url(args, options),
    method: 'post',
})

activatePortalUser.form = activatePortalUserForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::invitePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1221
* @route '/hris/employees/{employee}/invite-user'
*/
export const invitePortalUser = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invitePortalUser.url(args, options),
    method: 'post',
})

invitePortalUser.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/invite-user',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::invitePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1221
* @route '/hris/employees/{employee}/invite-user'
*/
invitePortalUser.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return invitePortalUser.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::invitePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1221
* @route '/hris/employees/{employee}/invite-user'
*/
invitePortalUser.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: invitePortalUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::invitePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1221
* @route '/hris/employees/{employee}/invite-user'
*/
const invitePortalUserForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invitePortalUser.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::invitePortalUser
* @see app/Http/Controllers/Hris/EmployeeController.php:1221
* @route '/hris/employees/{employee}/invite-user'
*/
invitePortalUserForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: invitePortalUser.url(args, options),
    method: 'post',
})

invitePortalUser.form = invitePortalUserForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePkwtt
* @see app/Http/Controllers/Hris/EmployeeController.php:1175
* @route '/hris/employees/{employee}/activate-pkwtt'
*/
export const activatePkwtt = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activatePkwtt.url(args, options),
    method: 'post',
})

activatePkwtt.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/activate-pkwtt',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePkwtt
* @see app/Http/Controllers/Hris/EmployeeController.php:1175
* @route '/hris/employees/{employee}/activate-pkwtt'
*/
activatePkwtt.url = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return activatePkwtt.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePkwtt
* @see app/Http/Controllers/Hris/EmployeeController.php:1175
* @route '/hris/employees/{employee}/activate-pkwtt'
*/
activatePkwtt.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activatePkwtt.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePkwtt
* @see app/Http/Controllers/Hris/EmployeeController.php:1175
* @route '/hris/employees/{employee}/activate-pkwtt'
*/
const activatePkwttForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activatePkwtt.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::activatePkwtt
* @see app/Http/Controllers/Hris/EmployeeController.php:1175
* @route '/hris/employees/{employee}/activate-pkwtt'
*/
activatePkwttForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: activatePkwtt.url(args, options),
    method: 'post',
})

activatePkwtt.form = activatePkwttForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:1257
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1257
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1257
* @route '/hris/employees/{employee}/offboard'
*/
offboard.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: offboard.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:1257
* @route '/hris/employees/{employee}/offboard'
*/
const offboardForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: offboard.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::offboard
* @see app/Http/Controllers/Hris/EmployeeController.php:1257
* @route '/hris/employees/{employee}/offboard'
*/
offboardForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: offboard.url(args, options),
    method: 'post',
})

offboard.form = offboardForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:1052
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1052
* @route '/hris/employees'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:1052
* @route '/hris/employees'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:1052
* @route '/hris/employees'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::store
* @see app/Http/Controllers/Hris/EmployeeController.php:1052
* @route '/hris/employees'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:1105
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1105
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1105
* @route '/hris/employees/{employee}'
*/
update.put = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::update
* @see app/Http/Controllers/Hris/EmployeeController.php:1105
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1105
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1318
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1318
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1318
* @route '/hris/employees/{employee}'
*/
destroy.delete = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeController::destroy
* @see app/Http/Controllers/Hris/EmployeeController.php:1318
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
* @see app/Http/Controllers/Hris/EmployeeController.php:1318
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

const EmployeeController = { index, resigned, downloadImportTemplate, importMethod, exportMethod, contract, activatePortalUser, invitePortalUser, activatePkwtt, offboard, store, update, destroy, import: importMethod, export: exportMethod }

export default EmployeeController