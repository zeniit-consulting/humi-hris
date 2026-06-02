import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::store
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:17
* @route '/hris/employees/{employee}/documents'
*/
export const store = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/employees/{employee}/documents',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::store
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:17
* @route '/hris/employees/{employee}/documents'
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
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::store
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:17
* @route '/hris/employees/{employee}/documents'
*/
store.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::store
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:17
* @route '/hris/employees/{employee}/documents'
*/
const storeForm = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::store
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:17
* @route '/hris/employees/{employee}/documents'
*/
storeForm.post = (args: { employee: number | { id: number } } | [employee: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::update
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:35
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
export const update = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/employees/{employee}/documents/{employeeDocument}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::update
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:35
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
update.url = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeDocument: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeDocument: typeof args.employeeDocument === 'object'
        ? args.employeeDocument.id
        : args.employeeDocument,
    }

    return update.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeDocument}', parsedArgs.employeeDocument.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::update
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:35
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
update.put = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::update
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:35
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
const updateForm = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::update
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:35
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
updateForm.put = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::destroy
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:81
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
export const destroy = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/employees/{employee}/documents/{employeeDocument}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::destroy
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:81
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
destroy.url = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeDocument: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeDocument: typeof args.employeeDocument === 'object'
        ? args.employeeDocument.id
        : args.employeeDocument,
    }

    return destroy.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeDocument}', parsedArgs.employeeDocument.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::destroy
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:81
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
destroy.delete = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::destroy
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:81
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
const destroyForm = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::destroy
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:81
* @route '/hris/employees/{employee}/documents/{employeeDocument}'
*/
destroyForm.delete = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
export const download = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

download.definition = {
    methods: ["get","head"],
    url: '/hris/employees/{employee}/documents/{employeeDocument}/download',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
download.url = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            employee: args[0],
            employeeDocument: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employee: typeof args.employee === 'object'
        ? args.employee.id
        : args.employee,
        employeeDocument: typeof args.employeeDocument === 'object'
        ? args.employeeDocument.id
        : args.employeeDocument,
    }

    return download.definition.url
            .replace('{employee}', parsedArgs.employee.toString())
            .replace('{employeeDocument}', parsedArgs.employeeDocument.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
download.get = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
download.head = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: download.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
const downloadForm = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
downloadForm.get = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\EmployeeDocumentController::download
* @see app/Http/Controllers/Hris/EmployeeDocumentController.php:90
* @route '/hris/employees/{employee}/documents/{employeeDocument}/download'
*/
downloadForm.head = (args: { employee: number | { id: number }, employeeDocument: number | { id: number } } | [employee: number | { id: number }, employeeDocument: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: download.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

download.form = downloadForm

const EmployeeDocumentController = { store, update, destroy, download }

export default EmployeeDocumentController