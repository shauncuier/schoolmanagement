<?php

namespace App\Services\Sms\Contracts;

use App\Services\Sms\SmsResult;

interface SmsDriver
{
    /**
     * The driver's registry key (e.g. "log", "ssl-wireless").
     */
    public function key(): string;

    /**
     * Send a single SMS to an already-normalised recipient number.
     */
    public function send(string $to, string $body): SmsResult;
}
