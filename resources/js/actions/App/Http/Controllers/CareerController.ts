import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/careers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::index
* @see app/Http/Controllers/CareerController.php:19
* @route '/careers'
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
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
export const show = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/careers/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
show.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    if (Array.isArray(args)) {
        args = {
            slug: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slug: args.slug,
    }

    return show.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
show.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
show.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
const showForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
showForm.get = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CareerController::show
* @see app/Http/Controllers/CareerController.php:76
* @route '/careers/{slug}'
*/
showForm.head = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\CareerController::storeApplication
* @see app/Http/Controllers/CareerController.php:109
* @route '/careers/{slug}/apply'
*/
export const storeApplication = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeApplication.url(args, options),
    method: 'post',
})

storeApplication.definition = {
    methods: ["post"],
    url: '/careers/{slug}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CareerController::storeApplication
* @see app/Http/Controllers/CareerController.php:109
* @route '/careers/{slug}/apply'
*/
storeApplication.url = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { slug: args }
    }

    if (Array.isArray(args)) {
        args = {
            slug: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        slug: args.slug,
    }

    return storeApplication.definition.url
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CareerController::storeApplication
* @see app/Http/Controllers/CareerController.php:109
* @route '/careers/{slug}/apply'
*/
storeApplication.post = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeApplication.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CareerController::storeApplication
* @see app/Http/Controllers/CareerController.php:109
* @route '/careers/{slug}/apply'
*/
const storeApplicationForm = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeApplication.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CareerController::storeApplication
* @see app/Http/Controllers/CareerController.php:109
* @route '/careers/{slug}/apply'
*/
storeApplicationForm.post = (args: { slug: string | number } | [slug: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: storeApplication.url(args, options),
    method: 'post',
})

storeApplication.form = storeApplicationForm

const CareerController = { index, show, storeApplication }

export default CareerController