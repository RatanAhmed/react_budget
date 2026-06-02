<?php

namespace App\Providers;

use App\Services\Payment\PaymentService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(PaymentService::class, fn () => new PaymentService());
    }

    public function boot(): void
    {
        Schema::defaultStringLength(191);
    }
}
