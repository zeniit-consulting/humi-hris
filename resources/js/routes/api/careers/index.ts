import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
export const index = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/careers/companies/{company}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
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
* @route '/api/careers/companies/{company}'
*/
index.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
const indexForm = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
indexForm.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
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
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
*/
export const show = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/careers/companies/{company}/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
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
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
*/
show.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
*/
show.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
*/
const showForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
*/
showForm.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:110
* @route '/api/careers/companies/{company}/{slug}'
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
* @see app/Http/Controllers/Api/PublicCareerController.php:171
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
export const apply = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

apply.definition = {
    methods: ["post"],
    url: '/api/careers/companies/{company}/{slug}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:171
* @route '/api/careers/companies/{company}/{slug}/apply'
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
* @see app/Http/Controllers/Api/PublicCareerController.php:171
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
apply.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:171
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
const applyForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:171
* @route '/api/careers/companies/{company}/{slug}/apply'
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