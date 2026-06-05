<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@bp.com'],
            [
                'name'              => 'Admin',
                'password'          => Hash::make('ratan123'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Regular user
        User::updateOrCreate(
            ['email' => 'ratan@bp.com'],
            [
                'name'              => 'Ratan',
                'password'          => Hash::make('ratan123'),
                'role'              => 'user',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            ServiceSeeder::class,
            ResumeTemplateSeeder::class,
            PaymentGatewaySeeder::class,
            PlanSeeder::class,
            DefaultAccountSeeder::class,
            DefaultCategorySeeder::class,
        ]);
    }
}
