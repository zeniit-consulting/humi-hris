import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
const index83b97fcc68ba725be7f633228664b45d = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index83b97fcc68ba725be7f633228664b45d.url(args, options),
    method: 'get',
})

index83b97fcc68ba725be7f633228664b45d.definition = {
    methods: ["get","head"],
    url: '/api/v1/companies/{company}/careers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index83b97fcc68ba725be7f633228664b45d.url = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index83b97fcc68ba725be7f633228664b45d.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index83b97fcc68ba725be7f633228664b45d.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index83b97fcc68ba725be7f633228664b45d.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index83b97fcc68ba725be7f633228664b45d.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index83b97fcc68ba725be7f633228664b45d.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
const index83b97fcc68ba725be7f633228664b45dForm = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index83b97fcc68ba725be7f633228664b45d.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index83b97fcc68ba725be7f633228664b45dForm.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index83b97fcc68ba725be7f633228664b45d.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/v1/companies/{company}/careers'
*/
index83b97fcc68ba725be7f633228664b45dForm.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index83b97fcc68ba725be7f633228664b45d.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index83b97fcc68ba725be7f633228664b45d.form = index83b97fcc68ba725be7f633228664b45dForm
/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
const index8cd898b3c47da0271142890d9754d978 = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8cd898b3c47da0271142890d9754d978.url(args, options),
    method: 'get',
})

index8cd898b3c47da0271142890d9754d978.definition = {
    methods: ["get","head"],
    url: '/api/careers/companies/{company}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index8cd898b3c47da0271142890d9754d978.url = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return index8cd898b3c47da0271142890d9754d978.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index8cd898b3c47da0271142890d9754d978.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index8cd898b3c47da0271142890d9754d978.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index8cd898b3c47da0271142890d9754d978.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index8cd898b3c47da0271142890d9754d978.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
const index8cd898b3c47da0271142890d9754d978Form = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8cd898b3c47da0271142890d9754d978.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index8cd898b3c47da0271142890d9754d978Form.get = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8cd898b3c47da0271142890d9754d978.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::index
* @see app/Http/Controllers/Api/PublicCareerController.php:21
* @route '/api/careers/companies/{company}'
*/
index8cd898b3c47da0271142890d9754d978Form.head = (args: { company: string | number } | [company: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index8cd898b3c47da0271142890d9754d978.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index8cd898b3c47da0271142890d9754d978.form = index8cd898b3c47da0271142890d9754d978Form

export const index = {
    '/api/v1/companies/{company}/careers': index83b97fcc68ba725be7f633228664b45d,
    '/api/careers/companies/{company}': index8cd898b3c47da0271142890d9754d978,
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
const show6615d4c5b54c71cddd9a563fffa1cc80 = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, options),
    method: 'get',
})

show6615d4c5b54c71cddd9a563fffa1cc80.definition = {
    methods: ["get","head"],
    url: '/api/v1/companies/{company}/careers/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show6615d4c5b54c71cddd9a563fffa1cc80.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
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

    return show6615d4c5b54c71cddd9a563fffa1cc80.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show6615d4c5b54c71cddd9a563fffa1cc80.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show6615d4c5b54c71cddd9a563fffa1cc80.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
const show6615d4c5b54c71cddd9a563fffa1cc80Form = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show6615d4c5b54c71cddd9a563fffa1cc80Form.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/v1/companies/{company}/careers/{slug}'
*/
show6615d4c5b54c71cddd9a563fffa1cc80Form.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show6615d4c5b54c71cddd9a563fffa1cc80.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show6615d4c5b54c71cddd9a563fffa1cc80.form = show6615d4c5b54c71cddd9a563fffa1cc80Form
/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
const show1baf64c6a421a873bb2c92f45481bd29 = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show1baf64c6a421a873bb2c92f45481bd29.url(args, options),
    method: 'get',
})

show1baf64c6a421a873bb2c92f45481bd29.definition = {
    methods: ["get","head"],
    url: '/api/careers/companies/{company}/{slug}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
show1baf64c6a421a873bb2c92f45481bd29.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
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

    return show1baf64c6a421a873bb2c92f45481bd29.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
show1baf64c6a421a873bb2c92f45481bd29.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show1baf64c6a421a873bb2c92f45481bd29.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
show1baf64c6a421a873bb2c92f45481bd29.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show1baf64c6a421a873bb2c92f45481bd29.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
const show1baf64c6a421a873bb2c92f45481bd29Form = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show1baf64c6a421a873bb2c92f45481bd29.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
show1baf64c6a421a873bb2c92f45481bd29Form.get = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show1baf64c6a421a873bb2c92f45481bd29.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::show
* @see app/Http/Controllers/Api/PublicCareerController.php:106
* @route '/api/careers/companies/{company}/{slug}'
*/
show1baf64c6a421a873bb2c92f45481bd29Form.head = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show1baf64c6a421a873bb2c92f45481bd29.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show1baf64c6a421a873bb2c92f45481bd29.form = show1baf64c6a421a873bb2c92f45481bd29Form

export const show = {
    '/api/v1/companies/{company}/careers/{slug}': show6615d4c5b54c71cddd9a563fffa1cc80,
    '/api/careers/companies/{company}/{slug}': show1baf64c6a421a873bb2c92f45481bd29,
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
const apply9d12fc3229c133c2358c68dfd8b5682d = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply9d12fc3229c133c2358c68dfd8b5682d.url(args, options),
    method: 'post',
})

apply9d12fc3229c133c2358c68dfd8b5682d.definition = {
    methods: ["post"],
    url: '/api/v1/companies/{company}/careers/{slug}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
apply9d12fc3229c133c2358c68dfd8b5682d.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
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

    return apply9d12fc3229c133c2358c68dfd8b5682d.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
apply9d12fc3229c133c2358c68dfd8b5682d.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apply9d12fc3229c133c2358c68dfd8b5682d.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
const apply9d12fc3229c133c2358c68dfd8b5682dForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply9d12fc3229c133c2358c68dfd8b5682d.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/v1/companies/{company}/careers/{slug}/apply'
*/
apply9d12fc3229c133c2358c68dfd8b5682dForm.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apply9d12fc3229c133c2358c68dfd8b5682d.url(args, options),
    method: 'post',
})

apply9d12fc3229c133c2358c68dfd8b5682d.form = apply9d12fc3229c133c2358c68dfd8b5682dForm
/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
const applydc43a4c45f34b03dc7eb746623ba9bfa = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: applydc43a4c45f34b03dc7eb746623ba9bfa.url(args, options),
    method: 'post',
})

applydc43a4c45f34b03dc7eb746623ba9bfa.definition = {
    methods: ["post"],
    url: '/api/careers/companies/{company}/{slug}/apply',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
applydc43a4c45f34b03dc7eb746623ba9bfa.url = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions) => {
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

    return applydc43a4c45f34b03dc7eb746623ba9bfa.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace('{slug}', parsedArgs.slug.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
applydc43a4c45f34b03dc7eb746623ba9bfa.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: applydc43a4c45f34b03dc7eb746623ba9bfa.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
const applydc43a4c45f34b03dc7eb746623ba9bfaForm = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: applydc43a4c45f34b03dc7eb746623ba9bfa.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\PublicCareerController::apply
* @see app/Http/Controllers/Api/PublicCareerController.php:163
* @route '/api/careers/companies/{company}/{slug}/apply'
*/
applydc43a4c45f34b03dc7eb746623ba9bfaForm.post = (args: { company: string | number, slug: string | number } | [company: string | number, slug: string | number ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: applydc43a4c45f34b03dc7eb746623ba9bfa.url(args, options),
    method: 'post',
})

applydc43a4c45f34b03dc7eb746623ba9bfa.form = applydc43a4c45f34b03dc7eb746623ba9bfaForm

export const apply = {
    '/api/v1/companies/{company}/careers/{slug}/apply': apply9d12fc3229c133c2358c68dfd8b5682d,
    '/api/careers/companies/{company}/{slug}/apply': applydc43a4c45f34b03dc7eb746623ba9bfa,
}

const PublicCareerController = { index, show, apply }

export default PublicCareerController