import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
export const outsourcing = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outsourcing.url(options),
    method: 'get',
})

outsourcing.definition = {
    methods: ["get","head"],
    url: '/hris-outsourcing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
outsourcing.url = (options?: RouteQueryOptions) => {
    return outsourcing.definition.url + queryParams(options)
}

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
outsourcing.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: outsourcing.url(options),
    method: 'get',
})

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
outsourcing.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: outsourcing.url(options),
    method: 'head',
})

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
const outsourcingForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: outsourcing.url(options),
    method: 'get',
})

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
outsourcingForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: outsourcing.url(options),
    method: 'get',
})

/**
* @see routes/web.php:233
* @route '/hris-outsourcing'
*/
outsourcingForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: outsourcing.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

outsourcing.form = outsourcingForm

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
export const retailFnb = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: retailFnb.url(options),
    method: 'get',
})

retailFnb.definition = {
    methods: ["get","head"],
    url: '/hris-retail-fnb',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
retailFnb.url = (options?: RouteQueryOptions) => {
    return retailFnb.definition.url + queryParams(options)
}

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
retailFnb.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: retailFnb.url(options),
    method: 'get',
})

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
retailFnb.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: retailFnb.url(options),
    method: 'head',
})

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
const retailFnbForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: retailFnb.url(options),
    method: 'get',
})

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
retailFnbForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: retailFnb.url(options),
    method: 'get',
})

/**
* @see routes/web.php:240
* @route '/hris-retail-fnb'
*/
retailFnbForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: retailFnb.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

retailFnb.form = retailFnbForm

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
export const manufakturShift = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manufakturShift.url(options),
    method: 'get',
})

manufakturShift.definition = {
    methods: ["get","head"],
    url: '/hris-manufaktur-shift',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
manufakturShift.url = (options?: RouteQueryOptions) => {
    return manufakturShift.definition.url + queryParams(options)
}

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
manufakturShift.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: manufakturShift.url(options),
    method: 'get',
})

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
manufakturShift.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: manufakturShift.url(options),
    method: 'head',
})

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
const manufakturShiftForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manufakturShift.url(options),
    method: 'get',
})

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
manufakturShiftForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manufakturShift.url(options),
    method: 'get',
})

/**
* @see routes/web.php:247
* @route '/hris-manufaktur-shift'
*/
manufakturShiftForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: manufakturShift.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

manufakturShift.form = manufakturShiftForm

const landing = {
    outsourcing: Object.assign(outsourcing, outsourcing),
    retailFnb: Object.assign(retailFnb, retailFnb),
    manufakturShift: Object.assign(manufakturShift, manufakturShift),
}

export default landing