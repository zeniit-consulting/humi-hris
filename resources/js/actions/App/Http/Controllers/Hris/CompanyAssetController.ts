import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/assets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::index
* @see app/Http/Controllers/Hris/CompanyAssetController.php:20
* @route '/hris/assets'
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
* @see \App\Http\Controllers\Hris\CompanyAssetController::store
* @see app/Http/Controllers/Hris/CompanyAssetController.php:84
* @route '/hris/assets'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/assets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::store
* @see app/Http/Controllers/Hris/CompanyAssetController.php:84
* @route '/hris/assets'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::store
* @see app/Http/Controllers/Hris/CompanyAssetController.php:84
* @route '/hris/assets'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::store
* @see app/Http/Controllers/Hris/CompanyAssetController.php:84
* @route '/hris/assets'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::store
* @see app/Http/Controllers/Hris/CompanyAssetController.php:84
* @route '/hris/assets'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::update
* @see app/Http/Controllers/Hris/CompanyAssetController.php:98
* @route '/hris/assets/{companyAsset}'
*/
export const update = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/assets/{companyAsset}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::update
* @see app/Http/Controllers/Hris/CompanyAssetController.php:98
* @route '/hris/assets/{companyAsset}'
*/
update.url = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { companyAsset: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { companyAsset: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            companyAsset: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        companyAsset: typeof args.companyAsset === 'object'
        ? args.companyAsset.id
        : args.companyAsset,
    }

    return update.definition.url
            .replace('{companyAsset}', parsedArgs.companyAsset.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::update
* @see app/Http/Controllers/Hris/CompanyAssetController.php:98
* @route '/hris/assets/{companyAsset}'
*/
update.put = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::update
* @see app/Http/Controllers/Hris/CompanyAssetController.php:98
* @route '/hris/assets/{companyAsset}'
*/
const updateForm = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::update
* @see app/Http/Controllers/Hris/CompanyAssetController.php:98
* @route '/hris/assets/{companyAsset}'
*/
updateForm.put = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\CompanyAssetController::destroy
* @see app/Http/Controllers/Hris/CompanyAssetController.php:113
* @route '/hris/assets/{companyAsset}'
*/
export const destroy = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/assets/{companyAsset}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::destroy
* @see app/Http/Controllers/Hris/CompanyAssetController.php:113
* @route '/hris/assets/{companyAsset}'
*/
destroy.url = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { companyAsset: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { companyAsset: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            companyAsset: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        companyAsset: typeof args.companyAsset === 'object'
        ? args.companyAsset.id
        : args.companyAsset,
    }

    return destroy.definition.url
            .replace('{companyAsset}', parsedArgs.companyAsset.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::destroy
* @see app/Http/Controllers/Hris/CompanyAssetController.php:113
* @route '/hris/assets/{companyAsset}'
*/
destroy.delete = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::destroy
* @see app/Http/Controllers/Hris/CompanyAssetController.php:113
* @route '/hris/assets/{companyAsset}'
*/
const destroyForm = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CompanyAssetController::destroy
* @see app/Http/Controllers/Hris/CompanyAssetController.php:113
* @route '/hris/assets/{companyAsset}'
*/
destroyForm.delete = (args: { companyAsset: number | { id: number } } | [companyAsset: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const CompanyAssetController = { index, store, update, destroy }

export default CompanyAssetController