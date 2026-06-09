import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import attendances from './attendances'
import attendanceRequests from './attendance-requests'
import leaves from './leaves'
import overtimes from './overtimes'
import kasbons from './kasbons'
import shiftChangeRequests from './shift-change-requests'
import payrolls from './payrolls'
import profile from './profile'
import announcements from './announcements'
import surveys from './surveys'
import assets from './assets'
import performances from './performances'
import clientVisits from './client-visits'
/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
export const summary = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

summary.definition = {
    methods: ["get","head"],
    url: '/portal/api/summary',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary.url = (options?: RouteQueryOptions) => {
    return summary.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summary.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: summary.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
const summaryForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summaryForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\Mobile\V1\PortalController::summary
* @see app/Http/Controllers/Api/Mobile/V1/PortalController.php:31
* @route '/portal/api/summary'
*/
summaryForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: summary.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

summary.form = summaryForm

const api = {
    summary: Object.assign(summary, summary),
    attendances: Object.assign(attendances, attendances),
    attendanceRequests: Object.assign(attendanceRequests, attendanceRequests),
    leaves: Object.assign(leaves, leaves),
    overtimes: Object.assign(overtimes, overtimes),
    kasbons: Object.assign(kasbons, kasbons),
    shiftChangeRequests: Object.assign(shiftChangeRequests, shiftChangeRequests),
    payrolls: Object.assign(payrolls, payrolls),
    profile: Object.assign(profile, profile),
    announcements: Object.assign(announcements, announcements),
    surveys: Object.assign(surveys, surveys),
    assets: Object.assign(assets, assets),
    performances: Object.assign(performances, performances),
    clientVisits: Object.assign(clientVisits, clientVisits),
}

export default api