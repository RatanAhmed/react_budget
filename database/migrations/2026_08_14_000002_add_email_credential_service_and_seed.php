<?php

use App\Models\Service;
use Illuminate\Database\Migrations\Migration;

/**
 * Seeds the 'email-credentials' service so the nav gate works
 * without touching any schema — no table changes needed here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Service::updateOrCreate(
            ['slug' => 'email-credentials'],
            [
                'title'         => 'Email Credentials',
                'slug'          => 'email-credentials',
                'description'   => 'Securely store and manage email addresses, passwords, and platform usage.',
                'icon'          => '📧',
                'color'         => 'indigo',
                'route'         => '/email-credentials',
                'category'      => 'utility',
                'requires_auth' => true,
                'is_active'     => true,
                'sort_order'    => 11,
                'badge'         => null,
                'features'      => [
                    'AES-256 encrypted passwords',
                    'Platform/AI usage tracking',
                    'Device count tracking',
                    'Monthly usage log',
                ],
                'modules'       => null,
            ]
        );
    }

    public function down(): void
    {
        Service::where('slug', 'email-credentials')->delete();
    }
};
