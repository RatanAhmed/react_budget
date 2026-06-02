<?php

namespace App\Models\Resume;

use App\Models\PaymentTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class ResumeDownload extends Model
{
    use HasFactory;

    protected $fillable = [
        'resume_id', 'user_id', 'transaction_id', 'format',
        'amount_paid', 'status', 'download_token', 'token_expires_at', 'downloaded_at',
    ];

    protected $casts = [
        'amount_paid'      => 'decimal:2',
        'token_expires_at' => 'datetime',
        'downloaded_at'    => 'datetime',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transaction()
    {
        return $this->belongsTo(PaymentTransaction::class, 'transaction_id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isPaid(): bool
    {
        return in_array($this->status, ['paid', 'free']);
    }

    public function hasValidToken(): bool
    {
        return $this->download_token
            && $this->token_expires_at
            && $this->token_expires_at->isFuture();
    }

    /**
     * Issue a fresh one-time download token valid for 15 minutes.
     */
    public function issueToken(): string
    {
        $token = Str::random(64);
        $this->update([
            'download_token'   => $token,
            'token_expires_at' => now()->addMinutes(15),
        ]);
        return $token;
    }
}
