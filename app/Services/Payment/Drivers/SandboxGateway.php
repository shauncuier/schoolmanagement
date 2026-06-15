<?php

namespace App\Services\Payment\Drivers;

use App\Models\PaymentIntent;
use App\Services\Payment\Contracts\PaymentGateway;
use App\Services\Payment\PaymentVerification;

/**
 * Development / fallback gateway. "Checkout" redirects straight back to our own
 * callback with a success status, so the full intent → callback → settlement
 * pipeline can be built and tested without any provider credentials.
 */
class SandboxGateway implements PaymentGateway
{
    public function key(): string
    {
        return 'sandbox';
    }

    public function checkoutUrl(PaymentIntent $intent): string
    {
        return route('fees.pay.callback', ['gateway' => $this->key()]).'?'.http_build_query([
            'reference' => $intent->reference,
            'status' => 'success',
        ]);
    }

    public function verify(PaymentIntent $intent, array $payload): PaymentVerification
    {
        $referenceMatches = ($payload['reference'] ?? null) === $intent->reference;
        $succeeded = ($payload['status'] ?? null) === 'success';

        if (! $referenceMatches || ! $succeeded) {
            return PaymentVerification::failure($payload);
        }

        // The sandbox trusts the server-side intent amount (never the client).
        return PaymentVerification::success('SBX-'.$intent->reference, (float) $intent->amount, $payload);
    }
}
