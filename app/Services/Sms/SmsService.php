<?php

namespace App\Services\Sms;

use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Models\Tenant;
use App\Services\Sms\Contracts\SmsDriver;
use Illuminate\Database\Eloquent\Model;

class SmsService
{
    /**
     * Resolve the SMS driver for a tenant. Falls back to the platform default,
     * then to the always-available "log" driver if misconfigured.
     */
    public function driverFor(?Tenant $tenant = null): SmsDriver
    {
        $key = $tenant?->getSetting('sms.provider') ?: config('sms.default');
        $class = config("sms.drivers.{$key}") ?? config('sms.drivers.log');

        return app($class);
    }

    /**
     * GSM-7 or Unicode? Any non-ASCII character (e.g. Bangla) forces Unicode,
     * which roughly halves the characters that fit per billable segment.
     */
    public function encoding(string $body): string
    {
        return preg_match('/[^\x00-\x7F]/u', $body) ? 'unicode' : 'gsm';
    }

    /**
     * Number of billable segments for a message body.
     */
    public function countSegments(string $body): int
    {
        $sizes = config('sms.segments.'.$this->encoding($body));
        $length = mb_strlen($body);

        if ($length <= $sizes['single']) {
            return 1;
        }

        return (int) ceil($length / $sizes['multi']);
    }

    /**
     * Estimated cost (BDT) for a message body.
     */
    public function estimateCost(string $body): float
    {
        return round($this->countSegments($body) * (float) config('sms.cost_per_segment'), 4);
    }

    /**
     * Normalise a Bangladeshi mobile number to the 880XXXXXXXXXX form.
     */
    public function normalizeNumber(string $raw): string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';
        $cc = config('sms.country_code');

        if (str_starts_with($digits, $cc)) {
            return $digits;
        }

        if (str_starts_with($digits, '0')) {
            return $cc.substr($digits, 1);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '1')) {
            return $cc.$digits;
        }

        return $digits;
    }

    /**
     * Is this a valid Bangladeshi mobile number (operator prefixes 013–019)?
     */
    public function isValidNumber(string $raw): bool
    {
        return (bool) preg_match('/^8801[3-9]\d{8}$/', $this->normalizeNumber($raw));
    }

    /**
     * Replace {{var}} / {{ var }} / {var} placeholders in a template body.
     */
    public function render(string $body, array $variables = []): string
    {
        foreach ($variables as $key => $value) {
            $body = str_replace(
                ['{{'.$key.'}}', '{{ '.$key.' }}', '{'.$key.'}'],
                (string) $value,
                $body
            );
        }

        return $body;
    }

    /**
     * Send one SMS and persist a notification log entry.
     */
    public function send(
        Tenant $tenant,
        string $to,
        string $body,
        ?Model $notifiable = null,
        ?NotificationTemplate $template = null,
    ): NotificationLog {
        $number = $this->normalizeNumber($to);
        $segments = $this->countSegments($body);
        $cost = $this->estimateCost($body);
        $driver = $this->driverFor($tenant);

        try {
            $result = $driver->send($number, $body);
        } catch (\Throwable $e) {
            $result = SmsResult::failure($driver->key(), $e->getMessage());
        }

        return NotificationLog::create([
            'tenant_id' => $tenant->id,
            'notifiable_type' => $notifiable?->getMorphClass(),
            'notifiable_id' => $notifiable?->getKey(),
            'notification_template_id' => $template?->id,
            'type' => 'sms',
            'provider' => $result->provider,
            'recipient' => $number,
            'provider_message_id' => $result->providerMessageId,
            'segments' => $segments,
            'cost' => $cost,
            'body' => $body,
            'status' => $result->success ? 'sent' : 'failed',
            'error_message' => $result->error,
            'sent_at' => $result->success ? now() : null,
        ]);
    }

    /**
     * Render a template and send it.
     */
    public function sendTemplate(
        Tenant $tenant,
        string $to,
        NotificationTemplate $template,
        array $variables = [],
        ?Model $notifiable = null,
    ): NotificationLog {
        return $this->send($tenant, $to, $this->render($template->body, $variables), $notifiable, $template);
    }

    /**
     * Send the same message to many recipients.
     *
     * @param  array<int, string>  $recipients
     * @return array{sent: int, failed: int, segments: int, cost: float, logs: array<int, NotificationLog>}
     */
    public function sendBulk(Tenant $tenant, array $recipients, string $body): array
    {
        $sent = 0;
        $failed = 0;
        $segments = 0;
        $cost = 0.0;
        $logs = [];

        foreach (array_unique($recipients) as $recipient) {
            $log = $this->send($tenant, $recipient, $body);
            $logs[] = $log;
            $segments += (int) $log->segments;
            $cost += (float) $log->cost;

            $log->status === 'sent' ? $sent++ : $failed++;
        }

        return [
            'sent' => $sent,
            'failed' => $failed,
            'segments' => $segments,
            'cost' => round($cost, 4),
            'logs' => $logs,
        ];
    }
}
