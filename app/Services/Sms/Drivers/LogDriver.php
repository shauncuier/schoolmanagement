<?php

namespace App\Services\Sms\Drivers;

use App\Services\Sms\Contracts\SmsDriver;
use App\Services\Sms\SmsResult;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Development / fallback driver. Records the message to the application log and
 * reports success without contacting any external provider. Lets the entire SMS
 * pipeline (templates, queue, logging, UI) be built and tested with no credentials.
 */
class LogDriver implements SmsDriver
{
    public function key(): string
    {
        return 'log';
    }

    public function send(string $to, string $body): SmsResult
    {
        $id = 'log_'.Str::uuid()->toString();

        Log::channel(config('logging.default'))->info('[SMS:log] message recorded', [
            'to' => $to,
            'body' => $body,
            'provider_message_id' => $id,
        ]);

        return SmsResult::success($this->key(), $id);
    }
}
