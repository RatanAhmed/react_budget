<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        \App\Models\User::factory()->create([
            'name'     => 'Admin',
            'email'    => 'admin@bp.com',
            'password' => Hash::make('ratan123'),
            'role'     => 'admin',
        ]);

        // Regular user (original)
        \App\Models\User::factory()->create([
            'name'  => 'Ratan',
            'email' => 'ratan@bp.com',
            'role'  => 'user',
        ]);

        $this->call([
            ServiceSeeder::class,
            ResumeTemplateSeeder::class,
            PaymentGatewaySeeder::class,
            PlanSeeder::class,
        ]);
    }
}
