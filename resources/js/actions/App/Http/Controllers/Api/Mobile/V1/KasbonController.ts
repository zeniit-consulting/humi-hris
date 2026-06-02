import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
const index93f9bf16b6a987142db330773e055f72 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index93f9bf16b6a987142db330773e055f72.url(options),
    method: 'get',
})

index93f9bf16b6a987142db330773e055f72.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/kasbons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
index93f9bf16b6a987142db330773e055f72.url = (options?: RouteQueryOptions) => {
    return index93f9bf16b6a987142db330773e055f72.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
index93f9bf16b6a987142db330773e055f72.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index93f9bf16b6a987142db330773e055f72.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
index93f9bf16b6a987142db330773e055f72.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index93f9bf16b6a987142db330773e055f72.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
const index93f9bf16b6a987142db330773e055f72Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index93f9bf16b6a987142db330773e055f72.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
index93f9bf16b6a987142db330773e055f72Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index93f9bf16b6a987142db330773e055f72.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/api/mobile/v1/kasbons'
*/
index93f9bf16b6a987142db330773e055f72Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index93f9bf16b6a987142db330773e055f72.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index93f9bf16b6a987142db330773e055f72.form = index93f9bf16b6a987142db330773e055f72Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
const index8da62fd1883e459821e40d5235c68a8c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'get',
})

index8da62fd1883e459821e40d5235c68a8c.definition = {
    methods: ["get","head"],
    url: '/portal/api/kasbons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
index8da62fd1883e459821e40d5235c68a8c.url = (options?: RouteQueryOptions) => {
    return index8da62fd1883e459821e40d5235c68a8c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
index8da62fd1883e459821e40d5235c68a8c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
index8da62fd1883e459821e40d5235c68a8c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
const index8da62fd1883e459821e40d5235c68a8cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
index8da62fd1883e459821e40d5235c68a8cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::index
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:21
* @route '/portal/api/kasbons'
*/
index8da62fd1883e459821e40d5235c68a8cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8da62fd1883e459821e40d5235c68a8c.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index8da62fd1883e459821e40d5235c68a8c.form = index8da62fd1883e459821e40d5235c68a8cForm

export const index = {
    '/api/mobile/v1/kasbons': index93f9bf16b6a987142db330773e055f72,
    '/portal/api/kasbons': index8da62fd1883e459821e40d5235c68a8c,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/api/mobile/v1/kasbons'
*/
const store93f9bf16b6a987142db330773e055f72 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store93f9bf16b6a987142db330773e055f72.url(options),
    method: 'post',
})

store93f9bf16b6a987142db330773e055f72.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/kasbons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/api/mobile/v1/kasbons'
*/
store93f9bf16b6a987142db330773e055f72.url = (options?: RouteQueryOptions) => {
    return store93f9bf16b6a987142db330773e055f72.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/api/mobile/v1/kasbons'
*/
store93f9bf16b6a987142db330773e055f72.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store93f9bf16b6a987142db330773e055f72.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/api/mobile/v1/kasbons'
*/
const store93f9bf16b6a987142db330773e055f72Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store93f9bf16b6a987142db330773e055f72.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/api/mobile/v1/kasbons'
*/
store93f9bf16b6a987142db330773e055f72Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store93f9bf16b6a987142db330773e055f72.url(options),
    method: 'post',
})

store93f9bf16b6a987142db330773e055f72.form = store93f9bf16b6a987142db330773e055f72Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/portal/api/kasbons'
*/
const store8da62fd1883e459821e40d5235c68a8c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'post',
})

store8da62fd1883e459821e40d5235c68a8c.definition = {
    methods: ["post"],
    url: '/portal/api/kasbons',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/portal/api/kasbons'
*/
store8da62fd1883e459821e40d5235c68a8c.url = (options?: RouteQueryOptions) => {
    return store8da62fd1883e459821e40d5235c68a8c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/portal/api/kasbons'
*/
store8da62fd1883e459821e40d5235c68a8c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/portal/api/kasbons'
*/
const store8da62fd1883e459821e40d5235c68a8cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::store
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:69
* @route '/portal/api/kasbons'
*/
store8da62fd1883e459821e40d5235c68a8cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store8da62fd1883e459821e40d5235c68a8c.url(options),
    method: 'post',
})

store8da62fd1883e459821e40d5235c68a8c.form = store8da62fd1883e459821e40d5235c68a8cForm

export const store = {
    '/api/mobile/v1/kasbons': store93f9bf16b6a987142db330773e055f72,
    '/portal/api/kasbons': store8da62fd1883e459821e40d5235c68a8c,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:108
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
export const update = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/kasbons/{employeeDeduction}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:108
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
update.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeDeduction: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeDeduction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeDeduction: typeof args.employeeDeduction === 'object'
        ? args.employeeDeduction.id
        : args.employeeDeduction,
    }

    return update.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:108
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
update.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:108
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
const updateForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::update
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:108
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
updateForm.put = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:130
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
export const destroy = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/mobile/v1/kasbons/{employeeDeduction}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:130
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroy.url = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { employeeDeduction: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { employeeDeduction: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            employeeDeduction: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        employeeDeduction: typeof args.employeeDeduction === 'object'
        ? args.employeeDeduction.id
        : args.employeeDeduction,
    }

    return destroy.definition.url
            .replace('{employeeDeduction}', parsedArgs.employeeDeduction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:130
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroy.delete = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:130
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
const destroyForm = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\KasbonController::destroy
* @see app/Http/Controllers/Api/Mobile/V1/KasbonController.php:130
* @route '/api/mobile/v1/kasbons/{employeeDeduction}'
*/
destroyForm.delete = (args: { employeeDeduction: number | { id: number } } | [employeeDeduction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const KasbonController = { index, store, update, destroy }

export default KasbonController