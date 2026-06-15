<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default payment gateway
    |--------------------------------------------------------------------------
    |
    | Platform-wide fallback gateway. The "sandbox" gateway completes payments
    | instantly without contacting a provider — ideal for development and tests.
    | Real Bangladeshi MFS providers (bKash, Nagad, Rocket) and aggregators
    | (SSLCOMMERZ, aamarPay) implement the same contract and register below.
    |
    */

    /*
    | Master switch for online (MFS) payments. Disabled for now — fees are
    | collected as cash/manual entry. Flip PAYMENT_ONLINE_ENABLED=true (and add a
    | real gateway driver below) to turn the payer-facing online flow back on.
    */
    'online_enabled' => env('PAYMENT_ONLINE_ENABLED', false),

    'default' => env('PAYMENT_GATEWAY', 'sandbox'),

    'drivers' => [
        'sandbox' => \App\Services\Payment\Drivers\SandboxGateway::class,
    ],

    'currency' => 'BDT',

    /*
    | How long a created payment intent stays payable before it expires.
    */
    'intent_ttl_minutes' => env('PAYMENT_INTENT_TTL', 30),
];
