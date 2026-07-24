import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal/api/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::index
* @see app/Http/Controllers/Api/PortalApprovalController.php:22
* @route '/portal/api/approvals'
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
* @see \App\Http\Controllers\Api\PortalApprovalController::approve
* @see app/Http/Controllers/Api/PortalApprovalController.php:34
* @route '/portal/api/approvals/{type}/{id}/approve'
*/
export const approve = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/portal/api/approvals/{type}/{id}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::approve
* @see app/Http/Controllers/Api/PortalApprovalController.php:34
* @route '/portal/api/approvals/{type}/{id}/approve'
*/
approve.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            type: args[0],
            id: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        type: args.type,
        id: args.id,
    }

    return approve.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::approve
* @see app/Http/Controllers/Api/PortalApprovalController.php:34
* @route '/portal/api/approvals/{type}/{id}/approve'
*/
approve.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::approve
* @see app/Http/Controllers/Api/PortalApprovalController.php:34
* @route '/portal/api/approvals/{type}/{id}/approve'
*/
const approveForm = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::approve
* @see app/Http/Controllers/Api/PortalApprovalController.php:34
* @route '/portal/api/approvals/{type}/{id}/approve'
*/
approveForm.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::reject
* @see app/Http/Controllers/Api/PortalApprovalController.php:47
* @route '/portal/api/approvals/{type}/{id}/reject'
*/
export const reject = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/portal/api/approvals/{type}/{id}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::reject
* @see app/Http/Controllers/Api/PortalApprovalController.php:47
* @route '/portal/api/approvals/{type}/{id}/reject'
*/
reject.url = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            type: args[0],
            id: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        type: args.type,
        id: args.id,
    }

    return reject.definition.url
            .replace('{type}', parsedArgs.type.toString())
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::reject
* @see app/Http/Controllers/Api/PortalApprovalController.php:47
* @route '/portal/api/approvals/{type}/{id}/reject'
*/
reject.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::reject
* @see app/Http/Controllers/Api/PortalApprovalController.php:47
* @route '/portal/api/approvals/{type}/{id}/reject'
*/
const rejectForm = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PortalApprovalController::reject
* @see app/Http/Controllers/Api/PortalApprovalController.php:47
* @route '/portal/api/approvals/{type}/{id}/reject'
*/
rejectForm.post = (args: { type: string | number, id: string | number } | [type: string | number, id: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const approvals = {
    index: Object.assign(index, index),
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default approvals