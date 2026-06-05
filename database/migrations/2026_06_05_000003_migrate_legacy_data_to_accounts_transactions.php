<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Migrate legacy financial data into the new accounts + transactions tables.
 *
 * Strategy:
 *  - One default "Main Wallet" account is created per user.
 *  - incomes      → transactions (type=income,   direction=credit)
 *  - expenses     → transactions (type=expense,  direction=debit)
 *  - savings      → transactions (type=saving,   direction=debit)
 *  - loan_repayments → transactions (type=lend_repayment / borrow_repayment, direction=credit / debit)
 *    The repayment type is determined from the parent loan's type.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Create one default account per user ────────────────────────────
        $users = DB::table('users')->get(['id', 'created_at']);

        $accountIdByUser = [];

        foreach ($users as $user) {
            $accountId = DB::table('accounts')->insertGetId([
                'name'            => 'Main Wallet',
                'type'            => 'cash',
                'currency'        => 'BDT',
                'opening_balance' => 0,
                'is_default'      => 1,
                'color'           => '#6366f1',
                'status'          => 1,
                'created_by'      => $user->id,
                'updated_by'      => $user->id,
                'created_at'      => $user->created_at,
                'updated_at'      => $user->created_at,
            ]);
            $accountIdByUser[$user->id] = $accountId;
        }

        // Helper — resolve account for a user; skip row if user has no account
        $accountFor = function (int $userId) use ($accountIdByUser): ?int {
            return $accountIdByUser[$userId] ?? null;
        };

        // Helper — build month/year from a date string
        $monthYear = function (string $date): array {
            $d = Carbon::parse($date);
            return [$d->month, $d->year];
        };

        $now = now()->toDateTimeString();

        // ── 2. Migrate incomes ────────────────────────────────────────────────
        // incomes: id, source, details, amount, status, type, month, year, created_by
        // Income type 3 (carry_forward) is skipped — it's now implicit from balance.
        $incomes = DB::table('incomes')
            ->whereNull('deleted_at')
            ->where('type', '!=', 3)    // skip old carry-forward entries
            ->get();

        foreach ($incomes as $row) {
            $userId    = $row->created_by;
            $accountId = $accountFor($userId);
            if (!$accountId) continue;

            // Build a real date from month/year (use 1st of month)
            $month = (int) $row->month ?: (int) date('n');
            $year  = (int) $row->year  ?: (int) date('Y');
            $date  = Carbon::createFromDate($year, $month, 1)->toDateString();

            DB::table('transactions')->insert([
                'account_id'     => $accountId,
                'type'           => 'income',
                'direction'      => 'credit',
                'amount'         => $row->amount,
                'date'           => $date,
                'month'          => $month,
                'year'           => $year,
                'description'    => trim("{$row->source} — {$row->details}"),
                'category_id'    => null,
                'budget_id'      => null,
                'reference_type' => null,
                'reference_id'   => null,
                'created_by'     => $userId,
                'updated_by'     => $userId,
                'created_at'     => $row->created_at ?? $now,
                'updated_at'     => $row->updated_at ?? $now,
            ]);
        }

        // ── 3. Migrate expenses ───────────────────────────────────────────────
        // expenses: id, date, details, amount, category_id, budget_id, income_id, created_by
        $expenses = DB::table('expenses')
            ->whereNull('deleted_at')
            ->get();

        foreach ($expenses as $row) {
            $userId    = $row->created_by;
            $accountId = $accountFor($userId);
            if (!$accountId) continue;

            [$month, $year] = $monthYear($row->date);

            DB::table('transactions')->insert([
                'account_id'     => $accountId,
                'type'           => 'expense',
                'direction'      => 'debit',
                'amount'         => $row->amount,
                'date'           => $row->date,
                'month'          => $month,
                'year'           => $year,
                'description'    => $row->details,
                'category_id'    => $row->category_id ?: null,
                'budget_id'      => $row->budget_id   ?: null,
                'reference_type' => null,
                'reference_id'   => null,
                'created_by'     => $userId,
                'updated_by'     => $userId,
                'created_at'     => $row->created_at ?? $now,
                'updated_at'     => $row->updated_at ?? $now,
            ]);
        }

        // ── 4. Migrate savings ────────────────────────────────────────────────
        // savings: id, date, details, amount, budget_id, income_id, saving_for, created_by
        $savings = DB::table('savings')
            ->whereNull('deleted_at')
            ->get();

        foreach ($savings as $row) {
            $userId    = $row->created_by;
            $accountId = $accountFor($userId);
            if (!$accountId) continue;

            [$month, $year] = $monthYear($row->date);

            $desc = $row->details ?? '';
            if (!empty($row->saving_for)) {
                $desc = $row->saving_for . ($desc ? " — {$desc}" : '');
            }

            DB::table('transactions')->insert([
                'account_id'     => $accountId,
                'type'           => 'saving',
                'direction'      => 'debit',
                'amount'         => $row->amount,
                'date'           => $row->date,
                'month'          => $month,
                'year'           => $year,
                'description'    => $desc ?: null,
                'category_id'    => null,
                'budget_id'      => $row->budget_id ?: null,
                'reference_type' => null,
                'reference_id'   => null,
                'created_by'     => $userId,
                'updated_by'     => $userId,
                'created_at'     => $row->created_at ?? $now,
                'updated_at'     => $row->updated_at ?? $now,
            ]);
        }

        // ── 5. Migrate loan repayments ────────────────────────────────────────
        // loan_repayments: id, loan_id, amount, note, repayment_date, created_by
        // We look up the parent loan type to decide direction.
        $repayments = DB::table('loan_repayments')
            ->whereNull('deleted_at')
            ->get();

        // Pre-load loans so we don't N+1
        $loansMap = DB::table('loans')
            ->whereNull('deleted_at')
            ->pluck('type', 'id')   // id => type (lend|borrow)
            ->toArray();

        foreach ($repayments as $row) {
            $userId    = $row->created_by;
            $accountId = $accountFor($userId);
            if (!$accountId) continue;

            $loanType  = $loansMap[$row->loan_id] ?? 'lend';
            // If original loan was lend (we gave money), repayment comes back → credit
            // If original loan was borrow (we got money), repayment goes out → debit
            $txnType   = $loanType === 'lend' ? 'lend_repayment' : 'borrow_repayment';
            $direction = $loanType === 'lend' ? 'credit' : 'debit';

            [$month, $year] = $monthYear($row->repayment_date);

            DB::table('transactions')->insert([
                'account_id'     => $accountId,
                'type'           => $txnType,
                'direction'      => $direction,
                'amount'         => $row->amount,
                'date'           => $row->repayment_date,
                'month'          => $month,
                'year'           => $year,
                'description'    => $row->note ?? "Repayment for loan #{$row->loan_id}",
                'category_id'    => null,
                'budget_id'      => null,
                'reference_type' => 'loan',
                'reference_id'   => $row->loan_id,
                'created_by'     => $userId,
                'updated_by'     => $userId,
                'created_at'     => $row->created_at ?? $now,
                'updated_at'     => $row->updated_at ?? $now,
            ]);
        }
    }

    public function down(): void
    {
        // On rollback, remove all migrated transactions and accounts.
        // Original tables are restored by migration 000004's down().
        DB::table('transactions')->truncate();
        DB::table('accounts')->truncate();
    }
};
