import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:206
* @route '/client/approvals/reimbursements/{reimbursement}/approve'
*/
export const approve = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/client/approvals/reimbursements/{reimbursement}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:206
* @route '/client/approvals/reimbursements/{reimbursement}/approve'
*/
approve.url = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reimbursement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reimbursement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reimbursement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reimbursement: typeof args.reimbursement === 'object'
        ? args.reimbursement.id
        : args.reimbursement,
    }

    return approve.definition.url
            .replace('{reimbursement}', parsedArgs.reimbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:206
* @route '/client/approvals/reimbursements/{reimbursement}/approve'
*/
approve.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:206
* @route '/client/approvals/reimbursements/{reimbursement}/approve'
*/
const approveForm = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::approve
* @see app/Http/Controllers/Client/ApprovalController.php:206
* @route '/client/approvals/reimbursements/{reimbursement}/approve'
*/
approveForm.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:215
* @route '/client/approvals/reimbursements/{reimbursement}/reject'
*/
export const reject = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/client/approvals/reimbursements/{reimbursement}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:215
* @route '/client/approvals/reimbursements/{reimbursement}/reject'
*/
reject.url = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { reimbursement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { reimbursement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            reimbursement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        reimbursement: typeof args.reimbursement === 'object'
        ? args.reimbursement.id
        : args.reimbursement,
    }

    return reject.definition.url
            .replace('{reimbursement}', parsedArgs.reimbursement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:215
* @route '/client/approvals/reimbursements/{reimbursement}/reject'
*/
reject.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:215
* @route '/client/approvals/reimbursements/{reimbursement}/reject'
*/
const rejectForm = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Client\ApprovalController::reject
* @see app/Http/Controllers/Client/ApprovalController.php:215
* @route '/client/approvals/reimbursements/{reimbursement}/reject'
*/
rejectForm.post = (args: { reimbursement: number | { id: number } } | [reimbursement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

const reimbursements = {
    approve: Object.assign(approve, approve),
    reject: Object.assign(reject, reject),
}

export default reimbursements