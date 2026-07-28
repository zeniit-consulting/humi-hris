import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
export const serviceWorker = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serviceWorker.url(options),
    method: 'get',
})

serviceWorker.definition = {
    methods: ["get","head"],
    url: '/firebase-messaging-sw.js',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
serviceWorker.url = (options?: RouteQueryOptions) => {
    return serviceWorker.definition.url + queryParams(options)
}

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
serviceWorker.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: serviceWorker.url(options),
    method: 'get',
})

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
serviceWorker.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: serviceWorker.url(options),
    method: 'head',
})

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
const serviceWorkerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: serviceWorker.url(options),
    method: 'get',
})

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
serviceWorkerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: serviceWorker.url(options),
    method: 'get',
})

/**
* @see routes/web.php:53
* @route '/firebase-messaging-sw.js'
*/
serviceWorkerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: serviceWorker.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

serviceWorker.form = serviceWorkerForm

const messaging = {
    serviceWorker: Object.assign(serviceWorker, serviceWorker),
}

export default messaging