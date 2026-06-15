<?php

namespace App\Services\Payment;

/**
 * Result of verifying a gateway callback.
 */
class PaymentVerification
{
    public function __construct(
        public readonly bool $success,
        public readonly ?string $gatewayTransactionId = null,
        public readonly ?float $amount = null,
        public readonly array $raw = [],
    ) {}

    public static function success(string $gatewayTransactionId, ?float $amount = null, array $raw = []): self
    {
        return new self(true, $gatewayTransactionId, $amount, $raw);
    }

    public static function failure(array $raw = []): self
    {
        return new self(false, null, null, $raw);
    }
}
