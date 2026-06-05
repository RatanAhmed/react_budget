<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultCategorySeeder extends Seeder
{
    // type: 0 = Expense, 1 = Income
    private const EXPENSE_CATEGORIES = [
        'Food & Dining',
        'Groceries',
        'Rent & Housing',
        'Utilities',
        'Transportation',
        'Fuel',
        'Healthcare & Medical',
        'Education',
        'Clothing & Apparel',
        'Entertainment',
        'Internet & Phone',
        'Personal Care',
        'Household Supplies',
        'Insurance',
        'Loan Repayment',
        'Savings Transfer',
        'Charity & Donations',
        'Travel',
        'Subscriptions',
        'Miscellaneous',
    ];

    private const INCOME_CATEGORIES = [
        'Salary',
        'Freelance',
        'Business Income',
        'Investment Returns',
        'Rental Income',
        'Bonus',
        'Commission',
        'Gift / Received',
        'Refund',
        'Other Income',
    ];

    private const TASK_CATEGORIES = [
        'Work',
        'Personal',
        'Shopping',
        'Health & Fitness',
        'Finance',
        'Education',
        'Home',
        'Travel',
        'Social',
        'Urgent',
    ];

    public function run(): void
    {
        $now   = now()->toDateTimeString();
        $users = DB::table('users')->pluck('id');

        foreach ($users as $userId) {
            // ── Financial categories (per-user) ───────────────────────────────
            $hasCategories = DB::table('categories')
                ->where('created_by', $userId)
                ->exists();

            if (! $hasCategories) {
                $rows = [];

                foreach (self::EXPENSE_CATEGORIES as $name) {
                    $rows[] = [
                        'name'       => $name,
                        'type'       => 0, // Expense
                        'status'     => 1,
                        'created_by' => $userId,
                        'updated_by' => $userId,
                        'deleted_by' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                foreach (self::INCOME_CATEGORIES as $name) {
                    $rows[] = [
                        'name'       => $name,
                        'type'       => 1, // Income
                        'status'     => 1,
                        'created_by' => $userId,
                        'updated_by' => $userId,
                        'deleted_by' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                DB::table('categories')->insert($rows);
            }

            // ── Task categories (per-user) ────────────────────────────────────
            $hasTaskCategories = DB::table('task_categories')
                ->where('created_by', $userId)
                ->exists();

            if (! $hasTaskCategories) {
                $rows = [];

                foreach (self::TASK_CATEGORIES as $name) {
                    $rows[] = [
                        'name'       => $name,
                        'status'     => 1,
                        'created_by' => $userId,
                        'updated_by' => $userId,
                        'deleted_by' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                DB::table('task_categories')->insert($rows);
            }
        }
    }
}
