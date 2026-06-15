<?php

namespace App\Services\Payment\Contracts;

use App\Models\PaymentIntent;
use App\Services\Payment\PaymentVerification;

interface PaymentGateway
{
    /**
     * The gateway's registry key (e.g. "sandbox", "bkash", "nagad").
     */
    public function key(): string;

    /**
     * The URL the payer should be redirected to in order to complete payment.
     */
    public function checkoutUrl(PaymentIntent $intent): string;

    /**
     * Verify a callback/IPN payload for the given intent (server-side).
     */
    public function verify(PaymentIntent $intent, array $payload): PaymentVerification;
}
