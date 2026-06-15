<?php

namespace App\Services\Sms;

/**
 * Outcome of a single driver send attempt.
 */
class SmsResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $provider,
        public readonly ?string $providerMessageId = null,
        public readonly ?string $error = null,
    ) {}

    public static function success(string $provider, ?string $providerMessageId = null): self
    {
        return new self(true, $provider, $providerMessageId, null);
    }

    public static function failure(string $provider, string $error): self
    {
        return new self(false, $provider, null, $error);
    }
}
