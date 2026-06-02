import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
const index41a4fa7d1e0c116485505fd3cba6d9d3 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'get',
})

index41a4fa7d1e0c116485505fd3cba6d9d3.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/leaves',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
index41a4fa7d1e0c116485505fd3cba6d9d3.url = (options?: RouteQueryOptions) => {
    return index41a4fa7d1e0c116485505fd3cba6d9d3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
index41a4fa7d1e0c116485505fd3cba6d9d3.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
index41a4fa7d1e0c116485505fd3cba6d9d3.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
const index41a4fa7d1e0c116485505fd3cba6d9d3Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
index41a4fa7d1e0c116485505fd3cba6d9d3Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/api/mobile/v1/leaves'
*/
index41a4fa7d1e0c116485505fd3cba6d9d3Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index41a4fa7d1e0c116485505fd3cba6d9d3.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index41a4fa7d1e0c116485505fd3cba6d9d3.form = index41a4fa7d1e0c116485505fd3cba6d9d3Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
const indexca766d02c68d8f588e7e1d15ad9708dc = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'get',
})

indexca766d02c68d8f588e7e1d15ad9708dc.definition = {
    methods: ["get","head"],
    url: '/portal/api/leaves',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexca766d02c68d8f588e7e1d15ad9708dc.url = (options?: RouteQueryOptions) => {
    return indexca766d02c68d8f588e7e1d15ad9708dc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexca766d02c68d8f588e7e1d15ad9708dc.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexca766d02c68d8f588e7e1d15ad9708dc.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
const indexca766d02c68d8f588e7e1d15ad9708dcForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexca766d02c68d8f588e7e1d15ad9708dcForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::index
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:21
* @route '/portal/api/leaves'
*/
indexca766d02c68d8f588e7e1d15ad9708dcForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexca766d02c68d8f588e7e1d15ad9708dc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexca766d02c68d8f588e7e1d15ad9708dc.form = indexca766d02c68d8f588e7e1d15ad9708dcForm

export const index = {
    '/api/mobile/v1/leaves': index41a4fa7d1e0c116485505fd3cba6d9d3,
    '/portal/api/leaves': indexca766d02c68d8f588e7e1d15ad9708dc,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/api/mobile/v1/leaves'
*/
const store41a4fa7d1e0c116485505fd3cba6d9d3 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'post',
})

store41a4fa7d1e0c116485505fd3cba6d9d3.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/leaves',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/api/mobile/v1/leaves'
*/
store41a4fa7d1e0c116485505fd3cba6d9d3.url = (options?: RouteQueryOptions) => {
    return store41a4fa7d1e0c116485505fd3cba6d9d3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/api/mobile/v1/leaves'
*/
store41a4fa7d1e0c116485505fd3cba6d9d3.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/api/mobile/v1/leaves'
*/
const store41a4fa7d1e0c116485505fd3cba6d9d3Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/api/mobile/v1/leaves'
*/
store41a4fa7d1e0c116485505fd3cba6d9d3Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store41a4fa7d1e0c116485505fd3cba6d9d3.url(options),
    method: 'post',
})

store41a4fa7d1e0c116485505fd3cba6d9d3.form = store41a4fa7d1e0c116485505fd3cba6d9d3Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
const storeca766d02c68d8f588e7e1d15ad9708dc = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'post',
})

storeca766d02c68d8f588e7e1d15ad9708dc.definition = {
    methods: ["post"],
    url: '/portal/api/leaves',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
storeca766d02c68d8f588e7e1d15ad9708dc.url = (options?: RouteQueryOptions) => {
    return storeca766d02c68d8f588e7e1d15ad9708dc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
storeca766d02c68d8f588e7e1d15ad9708dc.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
const storeca766d02c68d8f588e7e1d15ad9708dcForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::store
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:74
* @route '/portal/api/leaves'
*/
storeca766d02c68d8f588e7e1d15ad9708dcForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeca766d02c68d8f588e7e1d15ad9708dc.url(options),
    method: 'post',
})

storeca766d02c68d8f588e7e1d15ad9708dc.form = storeca766d02c68d8f588e7e1d15ad9708dcForm

export const store = {
    '/api/mobile/v1/leaves': store41a4fa7d1e0c116485505fd3cba6d9d3,
    '/portal/api/leaves': storeca766d02c68d8f588e7e1d15ad9708dc,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/api/mobile/v1/leaves/{leave}'
*/
const update266d27416d7915652abe7603f15e709d = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update266d27416d7915652abe7603f15e709d.url(args, options),
    method: 'put',
})

update266d27416d7915652abe7603f15e709d.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/leaves/{leave}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/api/mobile/v1/leaves/{leave}'
*/
update266d27416d7915652abe7603f15e709d.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return update266d27416d7915652abe7603f15e709d.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/api/mobile/v1/leaves/{leave}'
*/
update266d27416d7915652abe7603f15e709d.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update266d27416d7915652abe7603f15e709d.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/api/mobile/v1/leaves/{leave}'
*/
const update266d27416d7915652abe7603f15e709dForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update266d27416d7915652abe7603f15e709d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/api/mobile/v1/leaves/{leave}'
*/
update266d27416d7915652abe7603f15e709dForm.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update266d27416d7915652abe7603f15e709d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update266d27416d7915652abe7603f15e709d.form = update266d27416d7915652abe7603f15e709dForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
const update9fd2359cf1a2cac699e2f0822853f079 = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update9fd2359cf1a2cac699e2f0822853f079.url(args, options),
    method: 'put',
})

update9fd2359cf1a2cac699e2f0822853f079.definition = {
    methods: ["put"],
    url: '/portal/api/leaves/{leave}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
update9fd2359cf1a2cac699e2f0822853f079.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return update9fd2359cf1a2cac699e2f0822853f079.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
update9fd2359cf1a2cac699e2f0822853f079.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update9fd2359cf1a2cac699e2f0822853f079.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
const update9fd2359cf1a2cac699e2f0822853f079Form = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update9fd2359cf1a2cac699e2f0822853f079.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::update
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:101
* @route '/portal/api/leaves/{leave}'
*/
update9fd2359cf1a2cac699e2f0822853f079Form.put = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update9fd2359cf1a2cac699e2f0822853f079.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update9fd2359cf1a2cac699e2f0822853f079.form = update9fd2359cf1a2cac699e2f0822853f079Form

export const update = {
    '/api/mobile/v1/leaves/{leave}': update266d27416d7915652abe7603f15e709d,
    '/portal/api/leaves/{leave}': update9fd2359cf1a2cac699e2f0822853f079,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/api/mobile/v1/leaves/{leave}'
*/
const destroy266d27416d7915652abe7603f15e709d = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy266d27416d7915652abe7603f15e709d.url(args, options),
    method: 'delete',
})

destroy266d27416d7915652abe7603f15e709d.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/leaves/{leave}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/api/mobile/v1/leaves/{leave}'
*/
destroy266d27416d7915652abe7603f15e709d.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return destroy266d27416d7915652abe7603f15e709d.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/api/mobile/v1/leaves/{leave}'
*/
destroy266d27416d7915652abe7603f15e709d.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy266d27416d7915652abe7603f15e709d.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/api/mobile/v1/leaves/{leave}'
*/
const destroy266d27416d7915652abe7603f15e709dForm = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy266d27416d7915652abe7603f15e709d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/api/mobile/v1/leaves/{leave}'
*/
destroy266d27416d7915652abe7603f15e709dForm.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy266d27416d7915652abe7603f15e709d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy266d27416d7915652abe7603f15e709d.form = destroy266d27416d7915652abe7603f15e709dForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
const destroy9fd2359cf1a2cac699e2f0822853f079 = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy9fd2359cf1a2cac699e2f0822853f079.url(args, options),
    method: 'delete',
})

destroy9fd2359cf1a2cac699e2f0822853f079.definition = {
    methods: ["delete"],
    url: '/portal/api/leaves/{leave}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroy9fd2359cf1a2cac699e2f0822853f079.url = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { leave: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { leave: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            leave: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        leave: typeof args.leave === 'object'
        ? args.leave.id
        : args.leave,
    }

    return destroy9fd2359cf1a2cac699e2f0822853f079.definition.url
            .replace('{leave}', parsedArgs.leave.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroy9fd2359cf1a2cac699e2f0822853f079.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy9fd2359cf1a2cac699e2f0822853f079.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
const destroy9fd2359cf1a2cac699e2f0822853f079Form = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy9fd2359cf1a2cac699e2f0822853f079.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\LeaveController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/LeaveController.php:135
* @route '/portal/api/leaves/{leave}'
*/
destroy9fd2359cf1a2cac699e2f0822853f079Form.delete = (args: { leave: number | { id: number } } | [leave: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy9fd2359cf1a2cac699e2f0822853f079.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy9fd2359cf1a2cac699e2f0822853f079.form = destroy9fd2359cf1a2cac699e2f0822853f079Form

export const destroy = {
    '/api/mobile/v1/leaves/{leave}': destroy266d27416d7915652abe7603f15e709d,
    '/portal/api/leaves/{leave}': destroy9fd2359cf1a2cac699e2f0822853f079,
}

const LeaveController = { index, store, update, destroy }

export default LeaveController