<?php

use App\Services\Sms\Drivers\LogDriver;

return [

    /*
    |--------------------------------------------------------------------------
    | Default SMS driver
    |--------------------------------------------------------------------------
    |
    | Platform-wide fallback driver. Individual schools (tenants) may override
    | this via their settings JSON (key: sms.provider). The "log" driver records
    | messages without contacting a provider and is ideal for local development.
    |
    */

    'default' => env('SMS_DRIVER', 'log'),

    /*
    |--------------------------------------------------------------------------
    | Driver registry
    |--------------------------------------------------------------------------
    |
    | Maps a driver key to its implementing class. Add real Bangladeshi masking
    | providers (SSL Wireless, Boomcast, REVE, Twenty4, BulkSMSBD) here as they
    | are implemented.
    |
    */

    'drivers' => [
        'log' => LogDriver::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Segment sizing
    |--------------------------------------------------------------------------
    |
    | GSM-7 messages fit 160 chars (153 per part when concatenated). Unicode
    | messages — which any Bangla character forces — fit only 70 chars (67 per
    | part). Used to estimate billable segments and cost.
    |
    */

    'segments' => [
        'gsm' => ['single' => 160, 'multi' => 153],
        'unicode' => ['single' => 70, 'multi' => 67],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cost per segment (platform estimate, in BDT)
    |--------------------------------------------------------------------------
    */

    'cost_per_segment' => env('SMS_COST_PER_SEGMENT', 0.45),

    /*
    |--------------------------------------------------------------------------
    | Default country dialing code used when normalising local numbers
    |--------------------------------------------------------------------------
    */

    'country_code' => '880',
];
