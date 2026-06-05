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
        User::create([
            'name'              => 'Admin',
            'email'             => 'admin@bp.com',
            'password'          => Hash::make('ratan123'),
            'role'              => 'admin',
            'email_verified_at' => now(),
        ]);

        // Regular user
        User::create([
            'name'              => 'Ratan',
            'email'             => 'ratan@bp.com',
            'password'          => Hash::make('ratan123'),
            'role'              => 'user',
            'email_verified_at' => now(),
        ]);

        $this->call([
            ServiceSeeder::class,
            ResumeTemplateSeeder::class,
            PaymentGatewaySeeder::class,
            PlanSeeder::class,
        ]);
    }
}
