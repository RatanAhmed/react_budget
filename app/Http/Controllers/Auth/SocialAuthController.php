<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the OAuth provider's login page.
     */
    public function redirect(string $provider)
    {
        $this->validateProvider($provider);

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the OAuth callback from the provider.
     */
    public function callback(string $provider)
    {
        $this->validateProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Unable to authenticate with ' . ucfirst($provider) . '. Please try again.']);
        }

        $providerIdField = $provider . '_id'; // google_id | facebook_id

        // Try to find an existing user by social ID first, then by email
        $user = User::where($providerIdField, $socialUser->getId())->first()
            ?? User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Attach the social ID if not already set (e.g. user registered with email, now logging in with Google)
            if (! $user->$providerIdField) {
                $user->$providerIdField = $socialUser->getId();
            }
            if (! $user->avatar && $socialUser->getAvatar()) {
                $user->avatar = $socialUser->getAvatar();
            }
            $user->save();
        } else {
            // New user — register them
            $user = User::create([
                'name'           => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email'          => $socialUser->getEmail(),
                'avatar'         => $socialUser->getAvatar(),
                $providerIdField => $socialUser->getId(),
                'auth_provider'  => $provider,
                'password'       => null,
            ]);

            event(new Registered($user));
        }

        Auth::login($user, remember: true);

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private function validateProvider(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'facebook']), 404, 'Unsupported provider.');
    }
}
