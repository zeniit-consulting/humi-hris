import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:163
* @route '/hris/schedules/shifts'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/hris/schedules/shifts',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:163
* @route '/hris/schedules/shifts'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:163
* @route '/hris/schedules/shifts'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:163
* @route '/hris/schedules/shifts'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::store
* @see app/Http/Controllers/Hris/ScheduleController.php:163
* @route '/hris/schedules/shifts'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Hris\ScheduleController::update
* @see app/Http/Controllers/Hris/ScheduleController.php:193
* @route '/hris/schedules/shifts/{workShift}'
*/
export const update = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/hris/schedules/shifts/{workShift}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::update
* @see app/Http/Controllers/Hris/ScheduleController.php:193
* @route '/hris/schedules/shifts/{workShift}'
*/
update.url = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workShift: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { workShift: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            workShift: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        workShift: typeof args.workShift === 'object'
        ? args.workShift.id
        : args.workShift,
    }

    return update.definition.url
            .replace('{workShift}', parsedArgs.workShift.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::update
* @see app/Http/Controllers/Hris/ScheduleController.php:193
* @route '/hris/schedules/shifts/{workShift}'
*/
update.put = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::update
* @see app/Http/Controllers/Hris/ScheduleController.php:193
* @route '/hris/schedules/shifts/{workShift}'
*/
const updateForm = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::update
* @see app/Http/Controllers/Hris/ScheduleController.php:193
* @route '/hris/schedules/shifts/{workShift}'
*/
updateForm.put = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:215
* @route '/hris/schedules/shifts/{workShift}'
*/
export const destroy = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/hris/schedules/shifts/{workShift}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:215
* @route '/hris/schedules/shifts/{workShift}'
*/
destroy.url = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workShift: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { workShift: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            workShift: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        workShift: typeof args.workShift === 'object'
        ? args.workShift.id
        : args.workShift,
    }

    return destroy.definition.url
            .replace('{workShift}', parsedArgs.workShift.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:215
* @route '/hris/schedules/shifts/{workShift}'
*/
destroy.delete = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:215
* @route '/hris/schedules/shifts/{workShift}'
*/
const destroyForm = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Hris\ScheduleController::destroy
* @see app/Http/Controllers/Hris/ScheduleController.php:215
* @route '/hris/schedules/shifts/{workShift}'
*/
destroyForm.delete = (args: { workShift: number | { id: number } } | [workShift: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const shifts = {
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default shifts