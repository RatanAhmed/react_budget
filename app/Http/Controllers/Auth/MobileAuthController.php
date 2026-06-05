<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    private const OTP_TTL_MINUTES = 10;

    // ── Send OTP ──────────────────────────────────────────────────────────────

    /**
     * POST /auth/mobile/send-otp
     * Body: { mobile: "+8801711..." }
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'mobile' => ['required', 'string', 'regex:/^\+?[1-9]\d{6,14}$/'],
        ]);

        $mobile = $request->input('mobile');
        $otp    = $this->generateOtp();
        $key    = $this->cacheKey($mobile);

        // Store hashed OTP for OTP_TTL_MINUTES minutes
        Cache::put($key, bcrypt($otp), now()->addMinutes(self::OTP_TTL_MINUTES));

        $this->sendSms($mobile, $otp);

        return response()->json(['message' => 'OTP sent successfully. Valid for ' . self::OTP_TTL_MINUTES . ' minutes.']);
    }

    // ── Verify OTP & login/register ───────────────────────────────────────────

    /**
     * POST /auth/mobile/verify-otp
     * Body: { mobile: "+8801711...", otp: "123456" }
     * Name is not required — the user can set it later from their profile.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'mobile' => ['required', 'string', 'regex:/^\+?[1-9]\d{6,14}$/'],
            'otp'    => ['required', 'string', 'digits:6'],
        ]);

        $mobile = $request->input('mobile');
        $otp    = $request->input('otp');
        $key    = $this->cacheKey($mobile);

        $hashedOtp = Cache::get($key);

        if (! $hashedOtp || ! password_verify($otp, $hashedOtp)) {
            throw ValidationException::withMessages([
                'otp' => 'The OTP is invalid or has expired.',
            ]);
        }

        // Consume the OTP so it cannot be reused
        Cache::forget($key);

        $user = User::where('mobile', $mobile)->first();

        if ($user) {
            // Mark mobile as verified if not already
            if (! $user->mobile_verified_at) {
                $user->mobile_verified_at = now();
                $user->save();
            }
        } else {
            // New user — only mobile is required; name can be completed from profile later.
            // Auto-generate a placeholder name from the last 4 digits of the number.
            $digits      = preg_replace('/\D/', '', $mobile);
            $placeholder = 'User' . substr($digits, -4);

            $user = User::create([
                'name'               => $placeholder,
                'mobile'             => $mobile,
                'mobile_verified_at' => now(),
                'auth_provider'      => 'mobile',
                'password'           => null,
            ]);

            event(new Registered($user));
        }

        Auth::login($user, remember: true);

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function cacheKey(string $mobile): string
    {
        return 'otp:' . preg_replace('/\D/', '', $mobile);
    }

    /**
     * Send an SMS using the configured driver.
     * SMS_DRIVER=log  → writes OTP to laravel.log (good for development)
     * SMS_DRIVER=twilio → sends via Twilio (needs TWILIO_* env vars)
     */
    private function sendSms(string $mobile, string $otp): void
    {
        $message = 'Your verification code is: ' . $otp . '. Valid for ' . self::OTP_TTL_MINUTES . ' minutes.';

        $driver = config('services.sms.driver', 'log');

        if ($driver === 'twilio') {
            $this->sendViaTwilio($mobile, $message);
            return;
        }

        // Default: log driver — safe for development
        Log::info("[OTP] Mobile: {$mobile} — Code: {$otp}");
    }

    private function sendViaTwilio(string $mobile, string $message): void
    {
        $sid   = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from  = config('services.twilio.from');

        $client = new \Twilio\Rest\Client($sid, $token);
        $client->messages->create($mobile, ['from' => $from, 'body' => $message]);
    }
}
