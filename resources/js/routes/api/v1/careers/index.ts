import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
export const index = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/companies/{company}/careers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index.url = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

    if (Array.isArray(args)) {
        args = {
            company: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: args.company,
    }

    return index.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
const indexForm = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
indexForm.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
indexForm.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
export const show = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/v1/companies/{company}/careers/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            company: args[0],
            slug: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: args.company,
        slug: args.slug,
    }

    return show.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
const showForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
showForm.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:109
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
showForm.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:169
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
export const apply = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

apply.definition = {
    methods: ["post"],
    url: '/api/v1/companies/{company}/careers/{slug}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:169
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
apply.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            company: args[0],
            slug: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        company: args.company,
        slug: args.slug,
    }

    return apply.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:169
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
apply.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:169
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
const applyForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:169
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
applyForm.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply.url(args, options),
    method: 'post',
})

apply.form = applyForm

const careers = {
    index: Object.assign(index, index),
    show: Object.assign(show, show),
    apply: Object.assign(apply, apply),
}

export default careers