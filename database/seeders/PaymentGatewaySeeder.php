<?php

namespace Database\Seeders;

use App\Models\PaymentGateway;
use Illuminate\Database\Seeder;

class PaymentGatewaySeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            [
                'name'        => 'bKash',
                'slug'        => 'bkash',
                'color'       => '#E2136E',
                'description' => 'Pay with bKash mobile banking. Fast, secure, and widely used across Bangladesh.',
                'is_active'   => false,   // activate after adding real credentials
                'is_sandbox'  => true,
                'sort_order'  => 1,
                'credentials' => [
                    'app_key'    => '',
                    'app_secret' => '',
                    'username'   => '',
                    'password'   => '',
                ],
                'settings'    => [
                    'fee_type'    => 'percent',  // percent | fixed
                    'fee_value'   => 1.5,         // 1.5%
                    'min_amount'  => 10,
                    'max_amount'  => 25000,
                ],
            ],
            [
                'name'        => 'Nagad',
                'slug'        => 'nagad',
                'color'       => '#F6821F',
                'description' => 'Pay with Nagad — Bangladesh Post Office digital financial service.',
                'is_active'   => false,
                'is_sandbox'  => true,
                'sort_order'  => 2,
                'credentials' => [
                    'merchant_id'          => '',
                    'merchant_private_key' => '',
                    'nagad_public_key'     => '',
                ],
                'settings'    => [
                    'fee_type'    => 'percent',
                    'fee_value'   => 1.5,
                    'min_amount'  => 10,
                    'max_amount'  => 25000,
                ],
            ],
            [
                'name'        => 'Card',
                'slug'        => 'card',
                'color'       => '#1A56DB',
                'description' => 'Pay with Visa, Mastercard, or AMEX via SSL Commerz.',
                'is_active'   => false,
                'is_sandbox'  => true,
                'sort_order'  => 3,
                'credentials' => [
                    'store_id'     => '',
                    'store_passwd' => '',
                ],
                'settings'    => [
                    'fee_type'    => 'percent',
                    'fee_value'   => 2.0,
                    'min_amount'  => 10,
                    'max_amount'  => 500000,
                ],
            ],
            [
                'name'        => 'Cash',
                'slug'        => 'cash',
                'color'       => '#16A34A',
                'description' => 'Accept cash payments in person. Recorded instantly.',
                'is_active'   => true,   // always available
                'is_sandbox'  => false,
                'sort_order'  => 4,
                'credentials' => [],
                'settings'    => [
                    'fee_type'  => 'fixed',
                    'fee_value' => 0,
                ],
            ],
        ];

        foreach ($gateways as $data) {
            PaymentGateway::updateOrCreate(['slug' => $data['slug']], $data);
        }
    }
}
