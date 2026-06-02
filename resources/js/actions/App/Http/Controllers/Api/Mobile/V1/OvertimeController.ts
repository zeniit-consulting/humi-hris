import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
const indexc41e6875ebeba9b64963337d70cda7f6 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'get',
})

indexc41e6875ebeba9b64963337d70cda7f6.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
indexc41e6875ebeba9b64963337d70cda7f6.url = (options?: RouteQueryOptions) => {
    return indexc41e6875ebeba9b64963337d70cda7f6.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
indexc41e6875ebeba9b64963337d70cda7f6.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
indexc41e6875ebeba9b64963337d70cda7f6.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexc41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
const indexc41e6875ebeba9b64963337d70cda7f6Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexc41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
indexc41e6875ebeba9b64963337d70cda7f6Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexc41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/api/mobile/v1/overtimes'
*/
indexc41e6875ebeba9b64963337d70cda7f6Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: indexc41e6875ebeba9b64963337d70cda7f6.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

indexc41e6875ebeba9b64963337d70cda7f6.form = indexc41e6875ebeba9b64963337d70cda7f6Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
const index200b34c1c4a90c3d482a2edb15b09f8c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'get',
})

index200b34c1c4a90c3d482a2edb15b09f8c.definition = {
    methods: ["get","head"],
    url: '/portal/api/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index200b34c1c4a90c3d482a2edb15b09f8c.url = (options?: RouteQueryOptions) => {
    return index200b34c1c4a90c3d482a2edb15b09f8c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index200b34c1c4a90c3d482a2edb15b09f8c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index200b34c1c4a90c3d482a2edb15b09f8c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
const index200b34c1c4a90c3d482a2edb15b09f8cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index200b34c1c4a90c3d482a2edb15b09f8cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::index
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:22
* @route '/portal/api/overtimes'
*/
index200b34c1c4a90c3d482a2edb15b09f8cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index200b34c1c4a90c3d482a2edb15b09f8c.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index200b34c1c4a90c3d482a2edb15b09f8c.form = index200b34c1c4a90c3d482a2edb15b09f8cForm

export const index = {
    '/api/mobile/v1/overtimes': indexc41e6875ebeba9b64963337d70cda7f6,
    '/portal/api/overtimes': index200b34c1c4a90c3d482a2edb15b09f8c,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/api/mobile/v1/overtimes'
*/
const storec41e6875ebeba9b64963337d70cda7f6 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storec41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'post',
})

storec41e6875ebeba9b64963337d70cda7f6.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/overtimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/api/mobile/v1/overtimes'
*/
storec41e6875ebeba9b64963337d70cda7f6.url = (options?: RouteQueryOptions) => {
    return storec41e6875ebeba9b64963337d70cda7f6.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/api/mobile/v1/overtimes'
*/
storec41e6875ebeba9b64963337d70cda7f6.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storec41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/api/mobile/v1/overtimes'
*/
const storec41e6875ebeba9b64963337d70cda7f6Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storec41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/api/mobile/v1/overtimes'
*/
storec41e6875ebeba9b64963337d70cda7f6Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storec41e6875ebeba9b64963337d70cda7f6.url(options),
    method: 'post',
})

storec41e6875ebeba9b64963337d70cda7f6.form = storec41e6875ebeba9b64963337d70cda7f6Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
const store200b34c1c4a90c3d482a2edb15b09f8c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'post',
})

store200b34c1c4a90c3d482a2edb15b09f8c.definition = {
    methods: ["post"],
    url: '/portal/api/overtimes',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
store200b34c1c4a90c3d482a2edb15b09f8c.url = (options?: RouteQueryOptions) => {
    return store200b34c1c4a90c3d482a2edb15b09f8c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
store200b34c1c4a90c3d482a2edb15b09f8c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
const store200b34c1c4a90c3d482a2edb15b09f8cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::store
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:73
* @route '/portal/api/overtimes'
*/
store200b34c1c4a90c3d482a2edb15b09f8cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store200b34c1c4a90c3d482a2edb15b09f8c.url(options),
    method: 'post',
})

store200b34c1c4a90c3d482a2edb15b09f8c.form = store200b34c1c4a90c3d482a2edb15b09f8cForm

export const store = {
    '/api/mobile/v1/overtimes': storec41e6875ebeba9b64963337d70cda7f6,
    '/portal/api/overtimes': store200b34c1c4a90c3d482a2edb15b09f8c,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
const update65de6934cedaf072cb04235584a096d9 = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update65de6934cedaf072cb04235584a096d9.url(args, options),
    method: 'put',
})

update65de6934cedaf072cb04235584a096d9.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/overtimes/{overtime}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
update65de6934cedaf072cb04235584a096d9.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return update65de6934cedaf072cb04235584a096d9.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
update65de6934cedaf072cb04235584a096d9.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update65de6934cedaf072cb04235584a096d9.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
const update65de6934cedaf072cb04235584a096d9Form = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update65de6934cedaf072cb04235584a096d9.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
update65de6934cedaf072cb04235584a096d9Form.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update65de6934cedaf072cb04235584a096d9.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update65de6934cedaf072cb04235584a096d9.form = update65de6934cedaf072cb04235584a096d9Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
const update94a26eae2636bc900f7cbcf2e424008d = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update94a26eae2636bc900f7cbcf2e424008d.url(args, options),
    method: 'put',
})

update94a26eae2636bc900f7cbcf2e424008d.definition = {
    methods: ["put"],
    url: '/portal/api/overtimes/{overtime}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
update94a26eae2636bc900f7cbcf2e424008d.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return update94a26eae2636bc900f7cbcf2e424008d.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
update94a26eae2636bc900f7cbcf2e424008d.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update94a26eae2636bc900f7cbcf2e424008d.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
const update94a26eae2636bc900f7cbcf2e424008dForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update94a26eae2636bc900f7cbcf2e424008d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::update
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:103
* @route '/portal/api/overtimes/{overtime}'
*/
update94a26eae2636bc900f7cbcf2e424008dForm.put = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update94a26eae2636bc900f7cbcf2e424008d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update94a26eae2636bc900f7cbcf2e424008d.form = update94a26eae2636bc900f7cbcf2e424008dForm

export const update = {
    '/api/mobile/v1/overtimes/{overtime}': update65de6934cedaf072cb04235584a096d9,
    '/portal/api/overtimes/{overtime}': update94a26eae2636bc900f7cbcf2e424008d,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
const destroy65de6934cedaf072cb04235584a096d9 = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy65de6934cedaf072cb04235584a096d9.url(args, options),
    method: 'delete',
})

destroy65de6934cedaf072cb04235584a096d9.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/overtimes/{overtime}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
destroy65de6934cedaf072cb04235584a096d9.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return destroy65de6934cedaf072cb04235584a096d9.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
destroy65de6934cedaf072cb04235584a096d9.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy65de6934cedaf072cb04235584a096d9.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
const destroy65de6934cedaf072cb04235584a096d9Form = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy65de6934cedaf072cb04235584a096d9.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/api/mobile/v1/overtimes/{overtime}'
*/
destroy65de6934cedaf072cb04235584a096d9Form.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy65de6934cedaf072cb04235584a096d9.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy65de6934cedaf072cb04235584a096d9.form = destroy65de6934cedaf072cb04235584a096d9Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
const destroy94a26eae2636bc900f7cbcf2e424008d = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy94a26eae2636bc900f7cbcf2e424008d.url(args, options),
    method: 'delete',
})

destroy94a26eae2636bc900f7cbcf2e424008d.definition = {
    methods: ["delete"],
    url: '/portal/api/overtimes/{overtime}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
destroy94a26eae2636bc900f7cbcf2e424008d.url = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { overtime: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { overtime: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            overtime: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        overtime: typeof args.overtime === 'object'
        ? args.overtime.id
        : args.overtime,
    }

    return destroy94a26eae2636bc900f7cbcf2e424008d.definition.url
            .replace('{overtime}', parsedArgs.overtime.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
destroy94a26eae2636bc900f7cbcf2e424008d.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy94a26eae2636bc900f7cbcf2e424008d.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
const destroy94a26eae2636bc900f7cbcf2e424008dForm = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy94a26eae2636bc900f7cbcf2e424008d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\OvertimeController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/OvertimeController.php:135
* @route '/portal/api/overtimes/{overtime}'
*/
destroy94a26eae2636bc900f7cbcf2e424008dForm.delete = (args: { overtime: number | { id: number } } | [overtime: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy94a26eae2636bc900f7cbcf2e424008d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy94a26eae2636bc900f7cbcf2e424008d.form = destroy94a26eae2636bc900f7cbcf2e424008dForm

export const destroy = {
    '/api/mobile/v1/overtimes/{overtime}': destroy65de6934cedaf072cb04235584a096d9,
    '/portal/api/overtimes/{overtime}': destroy94a26eae2636bc900f7cbcf2e424008d,
}

const OvertimeController = { index, store, update, destroy }

export default OvertimeController