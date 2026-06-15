<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'kirimdev' => [
        'enabled' => (bool) env('KIRIMDEV_ENABLED', env('KIRIMDEV_API_KEY') || env('kirimdev_api_key')),
        'base_url' => env('KIRIMDEV_BASE_URL', 'https://api.kirimdev.com/v1'),
        'api_key' => env('KIRIMDEV_API_KEY', env('kirimdev_api_key')),
        'timeout' => (int) env('KIRIMDEV_TIMEOUT', 15),
        'otp_send_delay_seconds' => (int) env('KIRIMDEV_OTP_SEND_DELAY_SECONDS', 30),
        'registration_notification_phone' => env('KIRIMDEV_REGISTRATION_NOTIFICATION_PHONE'),
        'subscription_renewal_notification_phone' => env('KIRIMDEV_SUBSCRIPTION_RENEWAL_NOTIFICATION_PHONE', env('KIRIMDEV_REGISTRATION_NOTIFICATION_PHONE')),
    ],

    'pakasir' => [
        'base_url' => env('PAKASIR_BASE_URL', 'https://app.pakasir.com'),
        'project' => env('PAKASIR_PROJECT'),
        'api_key' => env('PAKASIR_API_KEY'),
        'timeout' => (int) env('PAKASIR_TIMEOUT', 15),
    ],

];
