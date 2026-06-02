import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
export const store = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/sub-companies/{subCompany}/locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
store.url = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
store.post = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
const storeForm = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::store
* @see app/Http/Controllers/Hris/SubCompanyController.php:107
* @route '/hris/sub-companies/{subCompany}/locations'
*/
storeForm.post = (args: { subCompany: number | { id: number } } | [subCompany: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
export const update = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/sub-companies/{subCompany}/locations/{location}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
update.url = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
update.put = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::update
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
const updateForm = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/SubCompanyController.php:123
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
updateForm.put = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
export const destroy = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/sub-companies/{subCompany}/locations/{location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroy.url = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{subCompany}', parsedArgs.subCompany.toString())
            .replace('{location}', parsedArgs.location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroy.delete = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\SubCompanyController::destroy
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
const destroyForm = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/Hris/SubCompanyController.php:142
* @route '/hris/sub-companies/{subCompany}/locations/{location}'
*/
destroyForm.delete = (args: { subCompany: number | { id: number }, location: number | { id: number } } | [subCompany: number | { id: number }, location: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const locations = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default locations