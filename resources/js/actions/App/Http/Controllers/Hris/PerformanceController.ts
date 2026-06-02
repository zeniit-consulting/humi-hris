import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/hris/performances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::index
* @see app/Http/Controllers/Hris/PerformanceController.php:32
* @route '/hris/performances'
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
* @see \App\Http\Controllers\Hris\PerformanceController::storePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:149
* @route '/hris/performances/periods'
*/
export const storePeriod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePeriod.url(options),
    method: 'post',
})

storePeriod.definition = {
    methods: ["post"],
    url: '/hris/performances/periods',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:149
* @route '/hris/performances/periods'
*/
storePeriod.url = (options?: RouteQueryOptions) => {
    return storePeriod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:149
* @route '/hris/performances/periods'
*/
storePeriod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePeriod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:149
* @route '/hris/performances/periods'
*/
const storePeriodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storePeriod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:149
* @route '/hris/performances/periods'
*/
storePeriodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storePeriod.url(options),
    method: 'post',
})

storePeriod.form = storePeriodForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updatePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:158
* @route '/hris/performances/periods/{period}'
*/
export const updatePeriod = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePeriod.url(args, options),
    method: 'put',
})

updatePeriod.definition = {
    methods: ["put"],
    url: '/hris/performances/periods/{period}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updatePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:158
* @route '/hris/performances/periods/{period}'
*/
updatePeriod.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { period: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            period: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        period: typeof args.period === 'object'
        ? args.period.id
        : args.period,
    }

    return updatePeriod.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updatePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:158
* @route '/hris/performances/periods/{period}'
*/
updatePeriod.put = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updatePeriod.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updatePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:158
* @route '/hris/performances/periods/{period}'
*/
const updatePeriodForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePeriod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updatePeriod
* @see app/Http/Controllers/Hris/PerformanceController.php:158
* @route '/hris/performances/periods/{period}'
*/
updatePeriodForm.put = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updatePeriod.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updatePeriod.form = updatePeriodForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:185
* @route '/hris/performances/templates'
*/
export const storeTemplate = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTemplate.url(options),
    method: 'post',
})

storeTemplate.definition = {
    methods: ["post"],
    url: '/hris/performances/templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:185
* @route '/hris/performances/templates'
*/
storeTemplate.url = (options?: RouteQueryOptions) => {
    return storeTemplate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:185
* @route '/hris/performances/templates'
*/
storeTemplate.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:185
* @route '/hris/performances/templates'
*/
const storeTemplateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeTemplate.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:185
* @route '/hris/performances/templates'
*/
storeTemplateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeTemplate.url(options),
    method: 'post',
})

storeTemplate.form = storeTemplateForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:194
* @route '/hris/performances/templates/{template}'
*/
export const updateTemplate = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

updateTemplate.definition = {
    methods: ["put"],
    url: '/hris/performances/templates/{template}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:194
* @route '/hris/performances/templates/{template}'
*/
updateTemplate.url = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return updateTemplate.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:194
* @route '/hris/performances/templates/{template}'
*/
updateTemplate.put = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateTemplate.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:194
* @route '/hris/performances/templates/{template}'
*/
const updateTemplateForm = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateTemplate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:194
* @route '/hris/performances/templates/{template}'
*/
updateTemplateForm.put = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateTemplate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateTemplate.form = updateTemplateForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:203
* @route '/hris/performances/templates/{template}'
*/
export const destroyTemplate = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTemplate.url(args, options),
    method: 'delete',
})

destroyTemplate.definition = {
    methods: ["delete"],
    url: '/hris/performances/templates/{template}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:203
* @route '/hris/performances/templates/{template}'
*/
destroyTemplate.url = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return destroyTemplate.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:203
* @route '/hris/performances/templates/{template}'
*/
destroyTemplate.delete = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyTemplate.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:203
* @route '/hris/performances/templates/{template}'
*/
const destroyTemplateForm = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyTemplate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyTemplate
* @see app/Http/Controllers/Hris/PerformanceController.php:203
* @route '/hris/performances/templates/{template}'
*/
destroyTemplateForm.delete = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyTemplate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyTemplate.form = destroyTemplateForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
export const storeMetric = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMetric.url(args, options),
    method: 'post',
})

storeMetric.definition = {
    methods: ["post"],
    url: '/hris/performances/templates/{template}/metrics',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
storeMetric.url = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return storeMetric.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
storeMetric.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeMetric.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
const storeMetricForm = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeMetric.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:212
* @route '/hris/performances/templates/{template}/metrics'
*/
storeMetricForm.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeMetric.url(args, options),
    method: 'post',
})

storeMetric.form = storeMetricForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeAttendanceDefaults
* @see app/Http/Controllers/Hris/PerformanceController.php:242
* @route '/hris/performances/templates/{template}/attendance-defaults'
*/
export const storeAttendanceDefaults = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAttendanceDefaults.url(args, options),
    method: 'post',
})

storeAttendanceDefaults.definition = {
    methods: ["post"],
    url: '/hris/performances/templates/{template}/attendance-defaults',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeAttendanceDefaults
* @see app/Http/Controllers/Hris/PerformanceController.php:242
* @route '/hris/performances/templates/{template}/attendance-defaults'
*/
storeAttendanceDefaults.url = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { template: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { template: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            template: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        template: typeof args.template === 'object'
        ? args.template.id
        : args.template,
    }

    return storeAttendanceDefaults.definition.url
            .replace('{template}', parsedArgs.template.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeAttendanceDefaults
* @see app/Http/Controllers/Hris/PerformanceController.php:242
* @route '/hris/performances/templates/{template}/attendance-defaults'
*/
storeAttendanceDefaults.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeAttendanceDefaults.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeAttendanceDefaults
* @see app/Http/Controllers/Hris/PerformanceController.php:242
* @route '/hris/performances/templates/{template}/attendance-defaults'
*/
const storeAttendanceDefaultsForm = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeAttendanceDefaults.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeAttendanceDefaults
* @see app/Http/Controllers/Hris/PerformanceController.php:242
* @route '/hris/performances/templates/{template}/attendance-defaults'
*/
storeAttendanceDefaultsForm.post = (args: { template: number | { id: number } } | [template: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeAttendanceDefaults.url(args, options),
    method: 'post',
})

storeAttendanceDefaults.form = storeAttendanceDefaultsForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
export const updateMetric = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMetric.url(args, options),
    method: 'put',
})

updateMetric.definition = {
    methods: ["put"],
    url: '/hris/performances/metrics/{metric}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
updateMetric.url = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metric: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { metric: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            metric: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        metric: typeof args.metric === 'object'
        ? args.metric.id
        : args.metric,
    }

    return updateMetric.definition.url
            .replace('{metric}', parsedArgs.metric.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
updateMetric.put = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMetric.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
const updateMetricForm = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMetric.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:224
* @route '/hris/performances/metrics/{metric}'
*/
updateMetricForm.put = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMetric.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateMetric.form = updateMetricForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
export const destroyMetric = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMetric.url(args, options),
    method: 'delete',
})

destroyMetric.definition = {
    methods: ["delete"],
    url: '/hris/performances/metrics/{metric}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroyMetric.url = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { metric: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { metric: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            metric: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        metric: typeof args.metric === 'object'
        ? args.metric.id
        : args.metric,
    }

    return destroyMetric.definition.url
            .replace('{metric}', parsedArgs.metric.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroyMetric.delete = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyMetric.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
const destroyMetricForm = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMetric.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyMetric
* @see app/Http/Controllers/Hris/PerformanceController.php:233
* @route '/hris/performances/metrics/{metric}'
*/
destroyMetricForm.delete = (args: { metric: number | { id: number } } | [metric: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyMetric.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyMetric.form = destroyMetricForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeReview
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
export const storeReview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeReview.url(options),
    method: 'post',
})

storeReview.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeReview
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
storeReview.url = (options?: RouteQueryOptions) => {
    return storeReview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeReview
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
storeReview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeReview.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeReview
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
const storeReviewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeReview.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeReview
* @see app/Http/Controllers/Hris/PerformanceController.php:267
* @route '/hris/performances/reviews'
*/
storeReviewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeReview.url(options),
    method: 'post',
})

storeReview.form = storeReviewForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateReview
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
export const updateReview = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateReview.url(args, options),
    method: 'put',
})

updateReview.definition = {
    methods: ["put"],
    url: '/hris/performances/reviews/{review}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateReview
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
updateReview.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return updateReview.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateReview
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
updateReview.put = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateReview.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateReview
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
const updateReviewForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateReview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateReview
* @see app/Http/Controllers/Hris/PerformanceController.php:309
* @route '/hris/performances/reviews/{review}'
*/
updateReviewForm.put = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateReview.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateReview.form = updateReviewForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
export const syncAttendance = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncAttendance.url(args, options),
    method: 'post',
})

syncAttendance.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews/{review}/sync-attendance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendance.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return syncAttendance.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendance.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: syncAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
const syncAttendanceForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncAttendance.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::syncAttendance
* @see app/Http/Controllers/Hris/PerformanceController.php:442
* @route '/hris/performances/reviews/{review}/sync-attendance'
*/
syncAttendanceForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: syncAttendance.url(args, options),
    method: 'post',
})

syncAttendance.form = syncAttendanceForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:339
* @route '/hris/performances/reviews/{review}/objectives'
*/
export const storeObjective = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeObjective.url(args, options),
    method: 'post',
})

storeObjective.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews/{review}/objectives',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:339
* @route '/hris/performances/reviews/{review}/objectives'
*/
storeObjective.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return storeObjective.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:339
* @route '/hris/performances/reviews/{review}/objectives'
*/
storeObjective.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeObjective.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:339
* @route '/hris/performances/reviews/{review}/objectives'
*/
const storeObjectiveForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeObjective.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:339
* @route '/hris/performances/reviews/{review}/objectives'
*/
storeObjectiveForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeObjective.url(args, options),
    method: 'post',
})

storeObjective.form = storeObjectiveForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeCheckIn
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
export const storeCheckIn = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCheckIn.url(args, options),
    method: 'post',
})

storeCheckIn.definition = {
    methods: ["post"],
    url: '/hris/performances/reviews/{review}/check-ins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeCheckIn
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
storeCheckIn.url = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { review: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { review: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            review: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        review: typeof args.review === 'object'
        ? args.review.id
        : args.review,
    }

    return storeCheckIn.definition.url
            .replace('{review}', parsedArgs.review.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeCheckIn
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
storeCheckIn.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeCheckIn.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeCheckIn
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
const storeCheckInForm = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCheckIn.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeCheckIn
* @see app/Http/Controllers/Hris/PerformanceController.php:453
* @route '/hris/performances/reviews/{review}/check-ins'
*/
storeCheckInForm.post = (args: { review: number | { id: number } } | [review: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeCheckIn.url(args, options),
    method: 'post',
})

storeCheckIn.form = storeCheckInForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
export const updateObjective = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateObjective.url(args, options),
    method: 'put',
})

updateObjective.definition = {
    methods: ["put"],
    url: '/hris/performances/objectives/{objective}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
updateObjective.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { objective: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { objective: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            objective: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        objective: typeof args.objective === 'object'
        ? args.objective.id
        : args.objective,
    }

    return updateObjective.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
updateObjective.put = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateObjective.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
const updateObjectiveForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateObjective.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:355
* @route '/hris/performances/objectives/{objective}'
*/
updateObjectiveForm.put = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateObjective.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateObjective.form = updateObjectiveForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
export const destroyObjective = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyObjective.url(args, options),
    method: 'delete',
})

destroyObjective.definition = {
    methods: ["delete"],
    url: '/hris/performances/objectives/{objective}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroyObjective.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { objective: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { objective: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            objective: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        objective: typeof args.objective === 'object'
        ? args.objective.id
        : args.objective,
    }

    return destroyObjective.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroyObjective.delete = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyObjective.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
const destroyObjectiveForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyObjective.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyObjective
* @see app/Http/Controllers/Hris/PerformanceController.php:367
* @route '/hris/performances/objectives/{objective}'
*/
destroyObjectiveForm.delete = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyObjective.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyObjective.form = destroyObjectiveForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
export const storeKeyResult = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKeyResult.url(args, options),
    method: 'post',
})

storeKeyResult.definition = {
    methods: ["post"],
    url: '/hris/performances/objectives/{objective}/key-results',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
storeKeyResult.url = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { objective: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { objective: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            objective: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        objective: typeof args.objective === 'object'
        ? args.objective.id
        : args.objective,
    }

    return storeKeyResult.definition.url
            .replace('{objective}', parsedArgs.objective.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
storeKeyResult.post = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeKeyResult.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
const storeKeyResultForm = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKeyResult.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::storeKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:380
* @route '/hris/performances/objectives/{objective}/key-results'
*/
storeKeyResultForm.post = (args: { objective: number | { id: number } } | [objective: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeKeyResult.url(args, options),
    method: 'post',
})

storeKeyResult.form = storeKeyResultForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
export const updateKeyResult = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateKeyResult.url(args, options),
    method: 'put',
})

updateKeyResult.definition = {
    methods: ["put"],
    url: '/hris/performances/key-results/{keyResult}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
updateKeyResult.url = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { keyResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { keyResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            keyResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        keyResult: typeof args.keyResult === 'object'
        ? args.keyResult.id
        : args.keyResult,
    }

    return updateKeyResult.definition.url
            .replace('{keyResult}', parsedArgs.keyResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
updateKeyResult.put = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateKeyResult.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
const updateKeyResultForm = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateKeyResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:396
* @route '/hris/performances/key-results/{keyResult}'
*/
updateKeyResultForm.put = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateKeyResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateKeyResult.form = updateKeyResultForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
export const destroyKeyResult = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyKeyResult.url(args, options),
    method: 'delete',
})

destroyKeyResult.definition = {
    methods: ["delete"],
    url: '/hris/performances/key-results/{keyResult}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroyKeyResult.url = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { keyResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { keyResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            keyResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        keyResult: typeof args.keyResult === 'object'
        ? args.keyResult.id
        : args.keyResult,
    }

    return destroyKeyResult.definition.url
            .replace('{keyResult}', parsedArgs.keyResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroyKeyResult.delete = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyKeyResult.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
const destroyKeyResultForm = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyKeyResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::destroyKeyResult
* @see app/Http/Controllers/Hris/PerformanceController.php:408
* @route '/hris/performances/key-results/{keyResult}'
*/
destroyKeyResultForm.delete = (args: { keyResult: number | { id: number } } | [keyResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyKeyResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyKeyResult.form = destroyKeyResultForm

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKpiResult
* @see app/Http/Controllers/Hris/PerformanceController.php:421
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
export const updateKpiResult = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateKpiResult.url(args, options),
    method: 'put',
})

updateKpiResult.definition = {
    methods: ["put"],
    url: '/hris/performances/kpi-results/{kpiResult}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKpiResult
* @see app/Http/Controllers/Hris/PerformanceController.php:421
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
updateKpiResult.url = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { kpiResult: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { kpiResult: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            kpiResult: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        kpiResult: typeof args.kpiResult === 'object'
        ? args.kpiResult.id
        : args.kpiResult,
    }

    return updateKpiResult.definition.url
            .replace('{kpiResult}', parsedArgs.kpiResult.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKpiResult
* @see app/Http/Controllers/Hris/PerformanceController.php:421
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
updateKpiResult.put = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateKpiResult.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKpiResult
* @see app/Http/Controllers/Hris/PerformanceController.php:421
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
const updateKpiResultForm = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateKpiResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\PerformanceController::updateKpiResult
* @see app/Http/Controllers/Hris/PerformanceController.php:421
* @route '/hris/performances/kpi-results/{kpiResult}'
*/
updateKpiResultForm.put = (args: { kpiResult: number | { id: number } } | [kpiResult: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateKpiResult.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateKpiResult.form = updateKpiResultForm

const PerformanceController = { index, storePeriod, updatePeriod, storeTemplate, updateTemplate, destroyTemplate, storeMetric, storeAttendanceDefaults, updateMetric, destroyMetric, storeReview, updateReview, syncAttendance, storeObjective, storeCheckIn, updateObjective, destroyObjective, storeKeyResult, updateKeyResult, destroyKeyResult, updateKpiResult }

export default PerformanceController