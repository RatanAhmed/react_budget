<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultAccountSeeder extends Seeder
{
    /**
     * Default account templates created for every user.
     * is_default = true on the first one (Cash / Main Wallet).
     */
    private const ACCOUNTS = [
        [
            'name'            => 'Cash',
            'type'            => 'cash',
            'color'           => '#22c55e', // green
            'is_default'      => true,
            'opening_balance' => 0,
        ],
        [
            'name'            => 'Bank Account',
            'type'            => 'bank',
            'color'           => '#3b82f6', // blue
            'is_default'      => false,
            'opening_balance' => 0,
        ],
        [
            'name'            => 'Mobile Wallet',
            'type'            => 'savings',
            'color'           => '#f97316', // orange  (bKash / Nagad style)
            'is_default'      => false,
            'opening_balance' => 0,
        ],
        [
            'name'            => 'Savings',
            'type'            => 'savings',
            'color'           => '#a855f7', // purple
            'is_default'      => false,
            'opening_balance' => 0,
        ],
        [
            'name'            => 'Credit Card',
            'type'            => 'credit',
            'color'           => '#ef4444', // red
            'is_default'      => false,
            'opening_balance' => 0,
        ],
    ];

    public function run(): void
    {
        $now   = now()->toDateTimeString();
        $users = DB::table('users')->pluck('id');

        foreach ($users as $userId) {
            // Skip if user already has accounts (safe to re-run)
            $exists = DB::table('accounts')
                ->where('created_by', $userId)
                ->exists();

            if ($exists) {
                continue;
            }

            foreach (self::ACCOUNTS as $account) {
                DB::table('accounts')->insert([
                    'name'            => $account['name'],
                    'type'            => $account['type'],
                    'currency'        => 'BDT',
                    'opening_balance' => $account['opening_balance'],
                    'is_default'      => $account['is_default'],
                    'color'           => $account['color'],
                    'status'          => true,
                    'created_by'      => $userId,
                    'updated_by'      => $userId,
                    'deleted_by'      => null,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }
        }
    }
}
