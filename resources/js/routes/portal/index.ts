import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import loginDf2c2a from './login'
import api from './api'
import payrollCe309f from './payroll'
import activity260dc3 from './activity'
/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/portal/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\PortalOtpLoginController::login
* @see app/Http/Controllers/Auth/PortalOtpLoginController.php:26
* @route '/portal/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/portal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalController::__invoke
* @see app/Http/Controllers/UserPortalController.php:17
* @route '/portal'
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
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
export const attendance = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})

attendance.definition = {
    methods: ["get","head"],
    url: '/portal/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
attendance.url = (options?: RouteQueryOptions) => {
    return attendance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
attendance.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
attendance.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendance.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
const attendanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
attendanceForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendance.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendance
* @see app/Http/Controllers/UserPortalSectionController.php:22
* @route '/portal/attendance'
*/
attendanceForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendance.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

attendance.form = attendanceForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
export const checkIn = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkIn.url(options),
    method: 'get',
})

checkIn.definition = {
    methods: ["get","head"],
    url: '/portal/check-in',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
checkIn.url = (options?: RouteQueryOptions) => {
    return checkIn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
checkIn.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkIn.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
checkIn.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkIn.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
const checkInForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkIn.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
checkInForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkIn.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkIn
* @see app/Http/Controllers/UserPortalSectionController.php:27
* @route '/portal/check-in'
*/
checkInForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkIn.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkIn.form = checkInForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
export const checkOut = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkOut.url(options),
    method: 'get',
})

checkOut.definition = {
    methods: ["get","head"],
    url: '/portal/check-out',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
checkOut.url = (options?: RouteQueryOptions) => {
    return checkOut.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
checkOut.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkOut.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
checkOut.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkOut.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
const checkOutForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkOut.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
checkOutForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkOut.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::checkOut
* @see app/Http/Controllers/UserPortalSectionController.php:32
* @route '/portal/check-out'
*/
checkOutForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkOut.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkOut.form = checkOutForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
export const shiftChange = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: shiftChange.url(options),
    method: 'get',
})

shiftChange.definition = {
    methods: ["get","head"],
    url: '/portal/shift-change',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
shiftChange.url = (options?: RouteQueryOptions) => {
    return shiftChange.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
shiftChange.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: shiftChange.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
shiftChange.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: shiftChange.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
const shiftChangeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: shiftChange.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
shiftChangeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: shiftChange.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::shiftChange
* @see app/Http/Controllers/UserPortalSectionController.php:37
* @route '/portal/shift-change'
*/
shiftChangeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: shiftChange.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

shiftChange.form = shiftChangeForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
export const attendanceRequest = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendanceRequest.url(options),
    method: 'get',
})

attendanceRequest.definition = {
    methods: ["get","head"],
    url: '/portal/attendance-request',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
attendanceRequest.url = (options?: RouteQueryOptions) => {
    return attendanceRequest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
attendanceRequest.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: attendanceRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
attendanceRequest.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: attendanceRequest.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
const attendanceRequestForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendanceRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
attendanceRequestForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendanceRequest.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::attendanceRequest
* @see app/Http/Controllers/UserPortalSectionController.php:42
* @route '/portal/attendance-request'
*/
attendanceRequestForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: attendanceRequest.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

attendanceRequest.form = attendanceRequestForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
export const leaves = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leaves.url(options),
    method: 'get',
})

leaves.definition = {
    methods: ["get","head"],
    url: '/portal/leaves',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
leaves.url = (options?: RouteQueryOptions) => {
    return leaves.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
leaves.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: leaves.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
leaves.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: leaves.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
const leavesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leaves.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
leavesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leaves.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::leaves
* @see app/Http/Controllers/UserPortalSectionController.php:47
* @route '/portal/leaves'
*/
leavesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: leaves.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

leaves.form = leavesForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
export const overtimes = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtimes.url(options),
    method: 'get',
})

overtimes.definition = {
    methods: ["get","head"],
    url: '/portal/overtimes',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
overtimes.url = (options?: RouteQueryOptions) => {
    return overtimes.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
overtimes.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: overtimes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
overtimes.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: overtimes.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
const overtimesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: overtimes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
overtimesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: overtimes.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::overtimes
* @see app/Http/Controllers/UserPortalSectionController.php:52
* @route '/portal/overtimes'
*/
overtimesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: overtimes.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

overtimes.form = overtimesForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
export const kasbons = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kasbons.url(options),
    method: 'get',
})

kasbons.definition = {
    methods: ["get","head"],
    url: '/portal/kasbons',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
kasbons.url = (options?: RouteQueryOptions) => {
    return kasbons.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
kasbons.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: kasbons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
kasbons.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: kasbons.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
const kasbonsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kasbons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
kasbonsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kasbons.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::kasbons
* @see app/Http/Controllers/UserPortalSectionController.php:57
* @route '/portal/kasbons'
*/
kasbonsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: kasbons.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

kasbons.form = kasbonsForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
export const reimbursements = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reimbursements.url(options),
    method: 'get',
})

reimbursements.definition = {
    methods: ["get","head"],
    url: '/portal/reimbursements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
reimbursements.url = (options?: RouteQueryOptions) => {
    return reimbursements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
reimbursements.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reimbursements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
reimbursements.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reimbursements.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
const reimbursementsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reimbursements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
reimbursementsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reimbursements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reimbursements
* @see app/Http/Controllers/UserPortalSectionController.php:64
* @route '/portal/reimbursements'
*/
reimbursementsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reimbursements.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reimbursements.form = reimbursementsForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
export const payroll = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payroll.url(options),
    method: 'get',
})

payroll.definition = {
    methods: ["get","head"],
    url: '/portal/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
payroll.url = (options?: RouteQueryOptions) => {
    return payroll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
payroll.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: payroll.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
payroll.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: payroll.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
const payrollForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payroll.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
payrollForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payroll.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::payroll
* @see app/Http/Controllers/UserPortalSectionController.php:69
* @route '/portal/payroll'
*/
payrollForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: payroll.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

payroll.form = payrollForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
export const activity = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})

activity.definition = {
    methods: ["get","head"],
    url: '/portal/activity',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
activity.url = (options?: RouteQueryOptions) => {
    return activity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
activity.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
activity.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: activity.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
const activityForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
activityForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::activity
* @see app/Http/Controllers/UserPortalSectionController.php:74
* @route '/portal/activity'
*/
activityForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: activity.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

activity.form = activityForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
export const profile = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

profile.definition = {
    methods: ["get","head"],
    url: '/portal/profile',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
profile.url = (options?: RouteQueryOptions) => {
    return profile.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
profile.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: profile.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
profile.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: profile.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
const profileForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: profile.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
profileForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: profile.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::profile
* @see app/Http/Controllers/UserPortalSectionController.php:89
* @route '/portal/profile'
*/
profileForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: profile.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

profile.form = profileForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
export const announcements = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(options),
    method: 'get',
})

announcements.definition = {
    methods: ["get","head"],
    url: '/portal/announcements',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
announcements.url = (options?: RouteQueryOptions) => {
    return announcements.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
announcements.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
announcements.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: announcements.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
const announcementsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
announcementsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::announcements
* @see app/Http/Controllers/UserPortalSectionController.php:94
* @route '/portal/announcements'
*/
announcementsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: announcements.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

announcements.form = announcementsForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
export const surveys = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: surveys.url(options),
    method: 'get',
})

surveys.definition = {
    methods: ["get","head"],
    url: '/portal/surveys',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
surveys.url = (options?: RouteQueryOptions) => {
    return surveys.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
surveys.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
surveys.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: surveys.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
const surveysForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
surveysForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::surveys
* @see app/Http/Controllers/UserPortalSectionController.php:99
* @route '/portal/surveys'
*/
surveysForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: surveys.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

surveys.form = surveysForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
export const assets = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assets.url(options),
    method: 'get',
})

assets.definition = {
    methods: ["get","head"],
    url: '/portal/assets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
assets.url = (options?: RouteQueryOptions) => {
    return assets.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
assets.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
assets.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: assets.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
const assetsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
assetsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::assets
* @see app/Http/Controllers/UserPortalSectionController.php:104
* @route '/portal/assets'
*/
assetsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: assets.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

assets.form = assetsForm

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
export const reprimands = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reprimands.url(options),
    method: 'get',
})

reprimands.definition = {
    methods: ["get","head"],
    url: '/portal/reprimands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
reprimands.url = (options?: RouteQueryOptions) => {
    return reprimands.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
reprimands.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
reprimands.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: reprimands.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
const reprimandsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
reprimandsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserPortalSectionController::reprimands
* @see app/Http/Controllers/UserPortalSectionController.php:109
* @route '/portal/reprimands'
*/
reprimandsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: reprimands.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

reprimands.form = reprimandsForm

const portal = {
    login: Object.assign(login, loginDf2c2a),
    index: Object.assign(index, index),
    api: Object.assign(api, api),
    attendance: Object.assign(attendance, attendance),
    checkIn: Object.assign(checkIn, checkIn),
    checkOut: Object.assign(checkOut, checkOut),
    shiftChange: Object.assign(shiftChange, shiftChange),
    attendanceRequest: Object.assign(attendanceRequest, attendanceRequest),
    leaves: Object.assign(leaves, leaves),
    overtimes: Object.assign(overtimes, overtimes),
    kasbons: Object.assign(kasbons, kasbons),
    reimbursements: Object.assign(reimbursements, reimbursements),
    payroll: Object.assign(payroll, payrollCe309f),
    activity: Object.assign(activity, activity260dc3),
    profile: Object.assign(profile, profile),
    announcements: Object.assign(announcements, announcements),
    surveys: Object.assign(surveys, surveys),
    assets: Object.assign(assets, assets),
    reprimands: Object.assign(reprimands, reprimands),
}

export default portal