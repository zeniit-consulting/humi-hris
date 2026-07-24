import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/approval-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::index
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:16
* @route '/hris/approval-settings'
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
* @see \App\Http\Controllers\Hris\ApprovalSettingController::update
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:28
* @route '/hris/approval-settings/{type}'
*/
export const update = (args: { type: string | number } | [type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/approval-settings/{type}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::update
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:28
* @route '/hris/approval-settings/{type}'
*/
update.url = (args: { type: string | number } | [type: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { type: args }
    }

    if (Array.isArray(args)) {
        args = {
            type: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        type: args.type,
    }

    return update.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::update
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:28
* @route '/hris/approval-settings/{type}'
*/
update.put = (args: { type: string | number } | [type: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::update
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:28
* @route '/hris/approval-settings/{type}'
*/
const updateForm = (args: { type: string | number } | [type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ApprovalSettingController::update
* @see app/Http/Controllers/Hris/ApprovalSettingController.php:28
* @route '/hris/approval-settings/{type}'
*/
updateForm.put = (args: { type: string | number } | [type: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

const approvalSettings = {
    index: Object.assign(index, index),
    update: Object.assign(update, update),
}

export default approvalSettings