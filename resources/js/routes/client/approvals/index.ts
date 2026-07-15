import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import attendance from './attendance'
import leaves from './leaves'
import overtimes from './overtimes'
import reimbursements from './reimbursements'
/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/client/approvals',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::index
* @see app/Http/Controllers/Client/ApprovalController.php:22
* @route '/client/approvals'
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

const approvals = {
    index: Object.assign(index, index),
    attendance: Object.assign(attendance, attendance),
    leaves: Object.assign(leaves, leaves),
    overtimes: Object.assign(overtimes, overtimes),
    reimbursements: Object.assign(reimbursements, reimbursements),
}

export default approvals