import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/career-transitions',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::index
* @see app/Http/Controllers/Hris/CareerTransitionController.php:25
* @route '/hris/career-transitions'
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
* @see \App\Http\Controllers\Hris\CareerTransitionController::store
* @see app/Http/Controllers/Hris/CareerTransitionController.php:132
* @route '/hris/career-transitions'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/career-transitions',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::store
* @see app/Http/Controllers/Hris/CareerTransitionController.php:132
* @route '/hris/career-transitions'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::store
* @see app/Http/Controllers/Hris/CareerTransitionController.php:132
* @route '/hris/career-transitions'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::store
* @see app/Http/Controllers/Hris/CareerTransitionController.php:132
* @route '/hris/career-transitions'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::store
* @see app/Http/Controllers/Hris/CareerTransitionController.php:132
* @route '/hris/career-transitions'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::approve
* @see app/Http/Controllers/Hris/CareerTransitionController.php:185
* @route '/hris/career-transitions/{careerTransition}/approve'
*/
export const approve = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/hris/career-transitions/{careerTransition}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::approve
* @see app/Http/Controllers/Hris/CareerTransitionController.php:185
* @route '/hris/career-transitions/{careerTransition}/approve'
*/
approve.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return approve.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::approve
* @see app/Http/Controllers/Hris/CareerTransitionController.php:185
* @route '/hris/career-transitions/{careerTransition}/approve'
*/
approve.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::approve
* @see app/Http/Controllers/Hris/CareerTransitionController.php:185
* @route '/hris/career-transitions/{careerTransition}/approve'
*/
const approveForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::approve
* @see app/Http/Controllers/Hris/CareerTransitionController.php:185
* @route '/hris/career-transitions/{careerTransition}/approve'
*/
approveForm.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: approve.url(args, options),
    method: 'post',
})

approve.form = approveForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::reject
* @see app/Http/Controllers/Hris/CareerTransitionController.php:207
* @route '/hris/career-transitions/{careerTransition}/reject'
*/
export const reject = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/hris/career-transitions/{careerTransition}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::reject
* @see app/Http/Controllers/Hris/CareerTransitionController.php:207
* @route '/hris/career-transitions/{careerTransition}/reject'
*/
reject.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return reject.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::reject
* @see app/Http/Controllers/Hris/CareerTransitionController.php:207
* @route '/hris/career-transitions/{careerTransition}/reject'
*/
reject.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::reject
* @see app/Http/Controllers/Hris/CareerTransitionController.php:207
* @route '/hris/career-transitions/{careerTransition}/reject'
*/
const rejectForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::reject
* @see app/Http/Controllers/Hris/CareerTransitionController.php:207
* @route '/hris/career-transitions/{careerTransition}/reject'
*/
rejectForm.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::apply
* @see app/Http/Controllers/Hris/CareerTransitionController.php:220
* @route '/hris/career-transitions/{careerTransition}/apply'
*/
export const apply = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

apply.definition = {
    methods: ["post"],
    url: '/hris/career-transitions/{careerTransition}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::apply
* @see app/Http/Controllers/Hris/CareerTransitionController.php:220
* @route '/hris/career-transitions/{careerTransition}/apply'
*/
apply.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return apply.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::apply
* @see app/Http/Controllers/Hris/CareerTransitionController.php:220
* @route '/hris/career-transitions/{careerTransition}/apply'
*/
apply.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::apply
* @see app/Http/Controllers/Hris/CareerTransitionController.php:220
* @route '/hris/career-transitions/{careerTransition}/apply'
*/
const applyForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::apply
* @see app/Http/Controllers/Hris/CareerTransitionController.php:220
* @route '/hris/career-transitions/{careerTransition}/apply'
*/
applyForm.post = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply.url(args, options),
    method: 'post',
})

apply.form = applyForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
export const downloadSk = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadSk.url(args, options),
    method: 'get',
})

downloadSk.definition = {
    methods: ["get","head"],
    url: '/hris/career-transitions/{careerTransition}/sk-document',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
downloadSk.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return downloadSk.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
downloadSk.get = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: downloadSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
downloadSk.head = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: downloadSk.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
const downloadSkForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
downloadSkForm.get = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::downloadSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:246
* @route '/hris/career-transitions/{careerTransition}/sk-document'
*/
downloadSkForm.head = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: downloadSk.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

downloadSk.form = downloadSkForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
export const previewSk = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: previewSk.url(args, options),
    method: 'get',
})

previewSk.definition = {
    methods: ["get","head"],
    url: '/hris/career-transitions/{careerTransition}/sk-preview',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
previewSk.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return previewSk.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
previewSk.get = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: previewSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
previewSk.head = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: previewSk.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
const previewSkForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
previewSkForm.get = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewSk.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::previewSk
* @see app/Http/Controllers/Hris/CareerTransitionController.php:253
* @route '/hris/career-transitions/{careerTransition}/sk-preview'
*/
previewSkForm.head = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: previewSk.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

previewSk.form = previewSkForm

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::destroy
* @see app/Http/Controllers/Hris/CareerTransitionController.php:229
* @route '/hris/career-transitions/{careerTransition}'
*/
export const destroy = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/career-transitions/{careerTransition}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::destroy
* @see app/Http/Controllers/Hris/CareerTransitionController.php:229
* @route '/hris/career-transitions/{careerTransition}'
*/
destroy.url = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { careerTransition: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { careerTransition: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            careerTransition: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        careerTransition: typeof args.careerTransition === 'object'
        ? args.careerTransition.id
        : args.careerTransition,
    }

    return destroy.definition.url
            .replace('{careerTransition}', parsedArgs.careerTransition.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::destroy
* @see app/Http/Controllers/Hris/CareerTransitionController.php:229
* @route '/hris/career-transitions/{careerTransition}'
*/
destroy.delete = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::destroy
* @see app/Http/Controllers/Hris/CareerTransitionController.php:229
* @route '/hris/career-transitions/{careerTransition}'
*/
const destroyForm = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\CareerTransitionController::destroy
* @see app/Http/Controllers/Hris/CareerTransitionController.php:229
* @route '/hris/career-transitions/{careerTransition}'
*/
destroyForm.delete = (args: { careerTransition: number | { id: number } } | [careerTransition: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const CareerTransitionController = { index, store, approve, reject, apply, downloadSk, previewSk, destroy }

export default CareerTransitionController