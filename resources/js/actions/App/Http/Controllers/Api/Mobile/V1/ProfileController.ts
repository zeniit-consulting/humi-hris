import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
const showe24a9090cf1b3a6ad58f290f9fc46d9b = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'get',
})

showe24a9090cf1b3a6ad58f290f9fc46d9b.definition = {
    methods: ["get","head"],
    url: '/api/mobile/v1/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
showe24a9090cf1b3a6ad58f290f9fc46d9b.url = (options?: RouteQueryOptions) => {
    return showe24a9090cf1b3a6ad58f290f9fc46d9b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
showe24a9090cf1b3a6ad58f290f9fc46d9b.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showe24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
showe24a9090cf1b3a6ad58f290f9fc46d9b.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showe24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
const showe24a9090cf1b3a6ad58f290f9fc46d9bForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showe24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
showe24a9090cf1b3a6ad58f290f9fc46d9bForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showe24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/api/mobile/v1/profile'
*/
showe24a9090cf1b3a6ad58f290f9fc46d9bForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showe24a9090cf1b3a6ad58f290f9fc46d9b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showe24a9090cf1b3a6ad58f290f9fc46d9b.form = showe24a9090cf1b3a6ad58f290f9fc46d9bForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
const showf4c1cc18896d027630f70f450a028c3a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showf4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'get',
})

showf4c1cc18896d027630f70f450a028c3a.definition = {
    methods: ["get","head"],
    url: '/portal/api/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
showf4c1cc18896d027630f70f450a028c3a.url = (options?: RouteQueryOptions) => {
    return showf4c1cc18896d027630f70f450a028c3a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
showf4c1cc18896d027630f70f450a028c3a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: showf4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
showf4c1cc18896d027630f70f450a028c3a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: showf4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
const showf4c1cc18896d027630f70f450a028c3aForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showf4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
showf4c1cc18896d027630f70f450a028c3aForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showf4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::show
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:24
* @route '/portal/api/profile'
*/
showf4c1cc18896d027630f70f450a028c3aForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: showf4c1cc18896d027630f70f450a028c3a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

showf4c1cc18896d027630f70f450a028c3a.form = showf4c1cc18896d027630f70f450a028c3aForm

export const show = {
    '/api/mobile/v1/profile': showe24a9090cf1b3a6ad58f290f9fc46d9b,
    '/portal/api/profile': showf4c1cc18896d027630f70f450a028c3a,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/api/mobile/v1/profile'
*/
const updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'put',
})

updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/api/mobile/v1/profile'
*/
updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.url = (options?: RouteQueryOptions) => {
    return updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/api/mobile/v1/profile'
*/
updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/api/mobile/v1/profile'
*/
const updateProfilee24a9090cf1b3a6ad58f290f9fc46d9bForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/api/mobile/v1/profile'
*/
updateProfilee24a9090cf1b3a6ad58f290f9fc46d9bForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b.form = updateProfilee24a9090cf1b3a6ad58f290f9fc46d9bForm
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/portal/api/profile'
*/
const updateProfilef4c1cc18896d027630f70f450a028c3a = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfilef4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'put',
})

updateProfilef4c1cc18896d027630f70f450a028c3a.definition = {
    methods: ["put"],
    url: '/portal/api/profile',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/portal/api/profile'
*/
updateProfilef4c1cc18896d027630f70f450a028c3a.url = (options?: RouteQueryOptions) => {
    return updateProfilef4c1cc18896d027630f70f450a028c3a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/portal/api/profile'
*/
updateProfilef4c1cc18896d027630f70f450a028c3a.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateProfilef4c1cc18896d027630f70f450a028c3a.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/portal/api/profile'
*/
const updateProfilef4c1cc18896d027630f70f450a028c3aForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProfilef4c1cc18896d027630f70f450a028c3a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateProfile
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:90
* @route '/portal/api/profile'
*/
updateProfilef4c1cc18896d027630f70f450a028c3aForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateProfilef4c1cc18896d027630f70f450a028c3a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateProfilef4c1cc18896d027630f70f450a028c3a.form = updateProfilef4c1cc18896d027630f70f450a028c3aForm

export const updateProfile = {
    '/api/mobile/v1/profile': updateProfilee24a9090cf1b3a6ad58f290f9fc46d9b,
    '/portal/api/profile': updateProfilef4c1cc18896d027630f70f450a028c3a,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/api/mobile/v1/profile/bank-account'
*/
const updateBankAccount271f2a0fe48648485a2b2691b19bf566 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBankAccount271f2a0fe48648485a2b2691b19bf566.url(options),
    method: 'put',
})

updateBankAccount271f2a0fe48648485a2b2691b19bf566.definition = {
    methods: ["put"],
    url: '/api/mobile/v1/profile/bank-account',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/api/mobile/v1/profile/bank-account'
*/
updateBankAccount271f2a0fe48648485a2b2691b19bf566.url = (options?: RouteQueryOptions) => {
    return updateBankAccount271f2a0fe48648485a2b2691b19bf566.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/api/mobile/v1/profile/bank-account'
*/
updateBankAccount271f2a0fe48648485a2b2691b19bf566.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBankAccount271f2a0fe48648485a2b2691b19bf566.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/api/mobile/v1/profile/bank-account'
*/
const updateBankAccount271f2a0fe48648485a2b2691b19bf566Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBankAccount271f2a0fe48648485a2b2691b19bf566.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/api/mobile/v1/profile/bank-account'
*/
updateBankAccount271f2a0fe48648485a2b2691b19bf566Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBankAccount271f2a0fe48648485a2b2691b19bf566.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateBankAccount271f2a0fe48648485a2b2691b19bf566.form = updateBankAccount271f2a0fe48648485a2b2691b19bf566Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/portal/api/profile/bank-account'
*/
const updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0 = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.url(options),
    method: 'put',
})

updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.definition = {
    methods: ["put"],
    url: '/portal/api/profile/bank-account',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/portal/api/profile/bank-account'
*/
updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.url = (options?: RouteQueryOptions) => {
    return updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/portal/api/profile/bank-account'
*/
updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/portal/api/profile/bank-account'
*/
const updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::updateBankAccount
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:157
* @route '/portal/api/profile/bank-account'
*/
updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0Form.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0.form = updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0Form

export const updateBankAccount = {
    '/api/mobile/v1/profile/bank-account': updateBankAccount271f2a0fe48648485a2b2691b19bf566,
    '/portal/api/profile/bank-account': updateBankAccount1142c48fa0ecdc8753623a9fdc346dc0,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/api/mobile/v1/profile/enroll-face'
*/
const enrollFacea39a1442a528cb3f1eb643a64eb901f4 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrollFacea39a1442a528cb3f1eb643a64eb901f4.url(options),
    method: 'post',
})

enrollFacea39a1442a528cb3f1eb643a64eb901f4.definition = {
    methods: ["post"],
    url: '/api/mobile/v1/profile/enroll-face',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/api/mobile/v1/profile/enroll-face'
*/
enrollFacea39a1442a528cb3f1eb643a64eb901f4.url = (options?: RouteQueryOptions) => {
    return enrollFacea39a1442a528cb3f1eb643a64eb901f4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/api/mobile/v1/profile/enroll-face'
*/
enrollFacea39a1442a528cb3f1eb643a64eb901f4.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrollFacea39a1442a528cb3f1eb643a64eb901f4.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/api/mobile/v1/profile/enroll-face'
*/
const enrollFacea39a1442a528cb3f1eb643a64eb901f4Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enrollFacea39a1442a528cb3f1eb643a64eb901f4.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/api/mobile/v1/profile/enroll-face'
*/
enrollFacea39a1442a528cb3f1eb643a64eb901f4Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enrollFacea39a1442a528cb3f1eb643a64eb901f4.url(options),
    method: 'post',
})

enrollFacea39a1442a528cb3f1eb643a64eb901f4.form = enrollFacea39a1442a528cb3f1eb643a64eb901f4Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/portal/api/profile/enroll-face'
*/
const enrollFace35001c96b32b7deaa8a3b07b622dd474 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrollFace35001c96b32b7deaa8a3b07b622dd474.url(options),
    method: 'post',
})

enrollFace35001c96b32b7deaa8a3b07b622dd474.definition = {
    methods: ["post"],
    url: '/portal/api/profile/enroll-face',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/portal/api/profile/enroll-face'
*/
enrollFace35001c96b32b7deaa8a3b07b622dd474.url = (options?: RouteQueryOptions) => {
    return enrollFace35001c96b32b7deaa8a3b07b622dd474.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/portal/api/profile/enroll-face'
*/
enrollFace35001c96b32b7deaa8a3b07b622dd474.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrollFace35001c96b32b7deaa8a3b07b622dd474.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/portal/api/profile/enroll-face'
*/
const enrollFace35001c96b32b7deaa8a3b07b622dd474Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enrollFace35001c96b32b7deaa8a3b07b622dd474.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::enrollFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:195
* @route '/portal/api/profile/enroll-face'
*/
enrollFace35001c96b32b7deaa8a3b07b622dd474Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enrollFace35001c96b32b7deaa8a3b07b622dd474.url(options),
    method: 'post',
})

enrollFace35001c96b32b7deaa8a3b07b622dd474.form = enrollFace35001c96b32b7deaa8a3b07b622dd474Form

export const enrollFace = {
    '/api/mobile/v1/profile/enroll-face': enrollFacea39a1442a528cb3f1eb643a64eb901f4,
    '/portal/api/profile/enroll-face': enrollFace35001c96b32b7deaa8a3b07b622dd474,
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
const deleteFacebf3360d5bf82863dc42358299c7ccfa7 = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url(options),
    method: 'delete',
})

deleteFacebf3360d5bf82863dc42358299c7ccfa7.definition = {
    methods: ["delete","post"],
    url: '/api/mobile/v1/profile/delete-face',
} satisfies RouteDefinition<["delete","post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
deleteFacebf3360d5bf82863dc42358299c7ccfa7.url = (options?: RouteQueryOptions) => {
    return deleteFacebf3360d5bf82863dc42358299c7ccfa7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
deleteFacebf3360d5bf82863dc42358299c7ccfa7.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
deleteFacebf3360d5bf82863dc42358299c7ccfa7.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
const deleteFacebf3360d5bf82863dc42358299c7ccfa7Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
deleteFacebf3360d5bf82863dc42358299c7ccfa7Form.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/api/mobile/v1/profile/delete-face'
*/
deleteFacebf3360d5bf82863dc42358299c7ccfa7Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFacebf3360d5bf82863dc42358299c7ccfa7.url(options),
    method: 'post',
})

deleteFacebf3360d5bf82863dc42358299c7ccfa7.form = deleteFacebf3360d5bf82863dc42358299c7ccfa7Form
/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
const deleteFaced788aaae6587b5152dbfb05409d0b1fc = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url(options),
    method: 'delete',
})

deleteFaced788aaae6587b5152dbfb05409d0b1fc.definition = {
    methods: ["delete","post"],
    url: '/portal/api/profile/delete-face',
} satisfies RouteDefinition<["delete","post"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
deleteFaced788aaae6587b5152dbfb05409d0b1fc.url = (options?: RouteQueryOptions) => {
    return deleteFaced788aaae6587b5152dbfb05409d0b1fc.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
deleteFaced788aaae6587b5152dbfb05409d0b1fc.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
deleteFaced788aaae6587b5152dbfb05409d0b1fc.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
const deleteFaced788aaae6587b5152dbfb05409d0b1fcForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
deleteFaced788aaae6587b5152dbfb05409d0b1fcForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\ProfileController::deleteFace
* @see app/Http/Controllers/Api/Mobile/V1/ProfileController.php:248
* @route '/portal/api/profile/delete-face'
*/
deleteFaced788aaae6587b5152dbfb05409d0b1fcForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: deleteFaced788aaae6587b5152dbfb05409d0b1fc.url(options),
    method: 'post',
})

deleteFaced788aaae6587b5152dbfb05409d0b1fc.form = deleteFaced788aaae6587b5152dbfb05409d0b1fcForm

export const deleteFace = {
    '/api/mobile/v1/profile/delete-face': deleteFacebf3360d5bf82863dc42358299c7ccfa7,
    '/portal/api/profile/delete-face': deleteFaced788aaae6587b5152dbfb05409d0b1fc,
}

const ProfileController = { show, updateProfile, updateBankAccount, enrollFace, deleteFace }

export default ProfileController