import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/sub-companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::index
* @see app/Http/Controllers/Hris/SubCompanyController.php:17
* @route '/hris/sub-companies'
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
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:63
* @route '/hris/sub-companies'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/sub-companies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:63
* @route '/hris/sub-companies'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:63
* @route '/hris/sub-companies'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:63
* @route '/hris/sub-companies'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:63
* @route '/hris/sub-companies'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:78
* @route '/hris/sub-companies/{subCompany}'
*/
export const update = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/sub-companies/{subCompany}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:78
* @route '/hris/sub-companies/{subCompany}'
*/
update.url = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subCompany: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subCompany: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subCompany: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subCompany: typeof args.subCompany === 'object'
        ? args.subCompany.id
        : args.subCompany,
    }

    return update.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:78
* @route '/hris/sub-companies/{subCompany}'
*/
update.put = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:78
* @route '/hris/sub-companies/{subCompany}'
*/
const updateForm = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:78
* @route '/hris/sub-companies/{subCompany}'
*/
updateForm.put = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:94
* @route '/hris/sub-companies/{subCompany}'
*/
export const destroy = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/sub-companies/{subCompany}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:94
* @route '/hris/sub-companies/{subCompany}'
*/
destroy.url = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subCompany: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subCompany: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subCompany: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subCompany: typeof args.subCompany === 'object'
        ? args.subCompany.id
        : args.subCompany,
    }

    return destroy.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:94
* @route '/hris/sub-companies/{subCompany}'
*/
destroy.delete = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:94
* @route '/hris/sub-companies/{subCompany}'
*/
const destroyForm = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:94
* @route '/hris/sub-companies/{subCompany}'
*/
destroyForm.delete = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\SubCompanyController::storeLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
export const storeLocation = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeLocation.url(args, options),
    method: 'post',
})

storeLocation.definition = {
    methods: ["post"],
    url: '/hris/sub-companies/{subCompany}/locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::storeLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
storeLocation.url = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { subCompany: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { subCompany: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            subCompany: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subCompany: typeof args.subCompany === 'object'
        ? args.subCompany.id
        : args.subCompany,
    }

    return storeLocation.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::storeLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
storeLocation.post = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeLocation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::storeLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
const storeLocationForm = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeLocation.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::storeLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
storeLocationForm.post = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeLocation.url(args, options),
    method: 'post',
})

storeLocation.form = storeLocationForm

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::updateLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
export const updateLocation = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

updateLocation.definition = {
    methods: ["put"],
    url: '/hris/sub-companies/{subCompany}/locations/{location}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::updateLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
updateLocation.url = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            subCompany: args[0],
            location: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subCompany: typeof args.subCompany === 'object'
        ? args.subCompany.id
        : args.subCompany,
        location: typeof args.location === 'object'
        ? args.location.id
        : args.location,
    }

    return updateLocation.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::updateLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
updateLocation.put = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateLocation.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::updateLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
const updateLocationForm = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::updateLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
updateLocationForm.put = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateLocation.form = updateLocationForm

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroyLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
export const destroyLocation = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyLocation.url(args, options),
    method: 'delete',
})

destroyLocation.definition = {
    methods: ["delete"],
    url: '/hris/sub-companies/{subCompany}/locations/{location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroyLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroyLocation.url = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            subCompany: args[0],
            location: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        subCompany: typeof args.subCompany === 'object'
        ? args.subCompany.id
        : args.subCompany,
        location: typeof args.location === 'object'
        ? args.location.id
        : args.location,
    }

    return destroyLocation.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroyLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroyLocation.delete = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyLocation.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroyLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
const destroyLocationForm = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroyLocation
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroyLocationForm.delete = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyLocation.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyLocation.form = destroyLocationForm

const SubCompanyController = { index, store, update, destroy, storeLocation, updateLocation, destroyLocation }

export default SubCompanyController