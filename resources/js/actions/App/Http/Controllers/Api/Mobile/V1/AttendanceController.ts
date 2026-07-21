import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
const indexea63611911431f088741f3964f160d76 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexea63611911431f088741f3964f160d76.url(options),
    method: 'get',
})

indexea63611911431f088741f3964f160d76.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/attendances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexea63611911431f088741f3964f160d76.url = (options?: RouteQueryOptions) => {
    return indexea63611911431f088741f3964f160d76.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexea63611911431f088741f3964f160d76.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexea63611911431f088741f3964f160d76.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexea63611911431f088741f3964f160d76.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexea63611911431f088741f3964f160d76.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
const indexea63611911431f088741f3964f160d76Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexea63611911431f088741f3964f160d76.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexea63611911431f088741f3964f160d76Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexea63611911431f088741f3964f160d76.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/api/mobile/v1/attendances'
*/
indexea63611911431f088741f3964f160d76Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexea63611911431f088741f3964f160d76.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexea63611911431f088741f3964f160d76.form = indexea63611911431f088741f3964f160d76Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
const indexbe11efe96fd46ed625db2e1257c96810 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'get',
})

indexbe11efe96fd46ed625db2e1257c96810.definition = {
    methods: ["get","head"],
    url: '/portal/api/attendances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
indexbe11efe96fd46ed625db2e1257c96810.url = (options?: RouteQueryOptions) => {
    return indexbe11efe96fd46ed625db2e1257c96810.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
indexbe11efe96fd46ed625db2e1257c96810.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexbe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
indexbe11efe96fd46ed625db2e1257c96810.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexbe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
const indexbe11efe96fd46ed625db2e1257c96810Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexbe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
indexbe11efe96fd46ed625db2e1257c96810Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexbe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::index
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:27
* @route '/portal/api/attendances'
*/
indexbe11efe96fd46ed625db2e1257c96810Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexbe11efe96fd46ed625db2e1257c96810.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexbe11efe96fd46ed625db2e1257c96810.form = indexbe11efe96fd46ed625db2e1257c96810Form

export const index = {
    '/api/mobile/v1/attendances': indexea63611911431f088741f3964f160d76,
    '/portal/api/attendances': indexbe11efe96fd46ed625db2e1257c96810,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
const storeea63611911431f088741f3964f160d76 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeea63611911431f088741f3964f160d76.url(options),
    method: 'post',
})

storeea63611911431f088741f3964f160d76.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/attendances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
storeea63611911431f088741f3964f160d76.url = (options?: RouteQueryOptions) => {
    return storeea63611911431f088741f3964f160d76.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
storeea63611911431f088741f3964f160d76.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeea63611911431f088741f3964f160d76.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
const storeea63611911431f088741f3964f160d76Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeea63611911431f088741f3964f160d76.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/api/mobile/v1/attendances'
*/
storeea63611911431f088741f3964f160d76Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeea63611911431f088741f3964f160d76.url(options),
    method: 'post',
})

storeea63611911431f088741f3964f160d76.form = storeea63611911431f088741f3964f160d76Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/portal/api/attendances'
*/
const storebe11efe96fd46ed625db2e1257c96810 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storebe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'post',
})

storebe11efe96fd46ed625db2e1257c96810.definition = {
    methods: ["post"],
    url: '/portal/api/attendances',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/portal/api/attendances'
*/
storebe11efe96fd46ed625db2e1257c96810.url = (options?: RouteQueryOptions) => {
    return storebe11efe96fd46ed625db2e1257c96810.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/portal/api/attendances'
*/
storebe11efe96fd46ed625db2e1257c96810.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storebe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/portal/api/attendances'
*/
const storebe11efe96fd46ed625db2e1257c96810Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storebe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::store
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:103
* @route '/portal/api/attendances'
*/
storebe11efe96fd46ed625db2e1257c96810Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storebe11efe96fd46ed625db2e1257c96810.url(options),
    method: 'post',
})

storebe11efe96fd46ed625db2e1257c96810.form = storebe11efe96fd46ed625db2e1257c96810Form

export const store = {
    '/api/mobile/v1/attendances': storeea63611911431f088741f3964f160d76,
    '/portal/api/attendances': storebe11efe96fd46ed625db2e1257c96810,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const update6847ebaffc100b9132c30c491935b11e = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6847ebaffc100b9132c30c491935b11e.url(args, options),
    method: 'put',
})

update6847ebaffc100b9132c30c491935b11e.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
update6847ebaffc100b9132c30c491935b11e.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return update6847ebaffc100b9132c30c491935b11e.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
update6847ebaffc100b9132c30c491935b11e.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update6847ebaffc100b9132c30c491935b11e.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const update6847ebaffc100b9132c30c491935b11eForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update6847ebaffc100b9132c30c491935b11e.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
update6847ebaffc100b9132c30c491935b11eForm.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update6847ebaffc100b9132c30c491935b11e.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update6847ebaffc100b9132c30c491935b11e.form = update6847ebaffc100b9132c30c491935b11eForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/portal/api/attendances/{employeeAttendance}'
*/
const update769c0a171c4e53a258dea5bb54a48795 = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update769c0a171c4e53a258dea5bb54a48795.url(args, options),
    method: 'put',
})

update769c0a171c4e53a258dea5bb54a48795.definition = {
    methods: ["put"],
    url: '/portal/api/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/portal/api/attendances/{employeeAttendance}'
*/
update769c0a171c4e53a258dea5bb54a48795.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return update769c0a171c4e53a258dea5bb54a48795.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/portal/api/attendances/{employeeAttendance}'
*/
update769c0a171c4e53a258dea5bb54a48795.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update769c0a171c4e53a258dea5bb54a48795.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/portal/api/attendances/{employeeAttendance}'
*/
const update769c0a171c4e53a258dea5bb54a48795Form = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update769c0a171c4e53a258dea5bb54a48795.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::update
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:184
* @route '/portal/api/attendances/{employeeAttendance}'
*/
update769c0a171c4e53a258dea5bb54a48795Form.put = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update769c0a171c4e53a258dea5bb54a48795.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update769c0a171c4e53a258dea5bb54a48795.form = update769c0a171c4e53a258dea5bb54a48795Form

export const update = {
    '/api/mobile/v1/attendances/{employeeAttendance}': update6847ebaffc100b9132c30c491935b11e,
    '/portal/api/attendances/{employeeAttendance}': update769c0a171c4e53a258dea5bb54a48795,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const destroy6847ebaffc100b9132c30c491935b11e = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy6847ebaffc100b9132c30c491935b11e.url(args, options),
    method: 'delete',
})

destroy6847ebaffc100b9132c30c491935b11e.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroy6847ebaffc100b9132c30c491935b11e.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return destroy6847ebaffc100b9132c30c491935b11e.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroy6847ebaffc100b9132c30c491935b11e.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy6847ebaffc100b9132c30c491935b11e.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
const destroy6847ebaffc100b9132c30c491935b11eForm = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy6847ebaffc100b9132c30c491935b11e.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/api/mobile/v1/attendances/{employeeAttendance}'
*/
destroy6847ebaffc100b9132c30c491935b11eForm.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy6847ebaffc100b9132c30c491935b11e.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy6847ebaffc100b9132c30c491935b11e.form = destroy6847ebaffc100b9132c30c491935b11eForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/portal/api/attendances/{employeeAttendance}'
*/
const destroy769c0a171c4e53a258dea5bb54a48795 = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy769c0a171c4e53a258dea5bb54a48795.url(args, options),
    method: 'delete',
})

destroy769c0a171c4e53a258dea5bb54a48795.definition = {
    methods: ["delete"],
    url: '/portal/api/attendances/{employeeAttendance}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/portal/api/attendances/{employeeAttendance}'
*/
destroy769c0a171c4e53a258dea5bb54a48795.url = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeAttendance: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeAttendance: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeAttendance: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeAttendance: typeof args.employeeAttendance === 'object'
        ? args.employeeAttendance.id
        : args.employeeAttendance,
    }

    return destroy769c0a171c4e53a258dea5bb54a48795.definition.url
            .replace('{employeeAttendance}', parsedArgs.employeeAttendance.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/portal/api/attendances/{employeeAttendance}'
*/
destroy769c0a171c4e53a258dea5bb54a48795.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy769c0a171c4e53a258dea5bb54a48795.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/portal/api/attendances/{employeeAttendance}'
*/
const destroy769c0a171c4e53a258dea5bb54a48795Form = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy769c0a171c4e53a258dea5bb54a48795.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\AttendanceController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/AttendanceController.php:231
* @route '/portal/api/attendances/{employeeAttendance}'
*/
destroy769c0a171c4e53a258dea5bb54a48795Form.delete = (args: { employeeAttendance: number | { id: number } } | [employeeAttendance: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy769c0a171c4e53a258dea5bb54a48795.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy769c0a171c4e53a258dea5bb54a48795.form = destroy769c0a171c4e53a258dea5bb54a48795Form

export const destroy = {
    '/api/mobile/v1/attendances/{employeeAttendance}': destroy6847ebaffc100b9132c30c491935b11e,
    '/portal/api/attendances/{employeeAttendance}': destroy769c0a171c4e53a258dea5bb54a48795,
}

const AttendanceController = { index, store, update, destroy }

export default AttendanceController