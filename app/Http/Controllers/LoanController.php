<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Loan;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'lend'); // lend | borrow

        $loans = Loan::with('repaymentTransactions')
            ->where('type', $type)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('search'), fn ($q) =>
                $q->where('person_name', 'like', '%' . $request->search . '%')
            )
            ->orderByRaw("FIELD(status,'unpaid','partial','paid')")
            ->orderByDesc('loan_date')
            ->get()
            ->map(fn (Loan $loan) => [
                'id'           => $loan->id,
                'type'         => $loan->type,
                'person_name'  => $loan->person_name,
                'person_phone' => $loan->person_phone,
                'amount'       => $loan->amount,
                'paid_amount'  => $loan->paid_amount,
                'outstanding'  => $loan->outstanding,
                'note'         => $loan->note,
                'loan_date'    => $loan->loan_date?->toDateString(),
                'due_date'     => $loan->due_date?->toDateString(),
                'status'       => $loan->status,
                'is_overdue'   => $loan->is_overdue,
                'repayments'   => $loan->repaymentTransactions->map(fn ($t) => [
                    'id'             => $t->id,
                    'amount'         => $t->amount,
                    'note'           => $t->description,
                    'repayment_date' => $t->date?->toDateString(),
                ]),
            ]);

        // Summary totals for the active tab
        $summary = [
            'total_amount'      => $loans->sum('amount'),
            'total_paid'        => $loans->sum('paid_amount'),
            'total_outstanding' => $loans->sum('outstanding'),
            'count_unpaid'      => $loans->where('status', 'unpaid')->count(),
            'count_partial'     => $loans->where('status', 'partial')->count(),
            'count_paid'        => $loans->where('status', 'paid')->count(),
        ];

        $accounts = Account::withoutGlobalScopes()
            ->where('created_by', auth()->id())
            ->where('status', true)
            ->get(['id', 'name', 'type']);

        return Inertia::render('Loan/Index', [
            'loans'    => $loans,
            'summary'  => $summary,
            'accounts' => $accounts,
            'filters'  => [
                'type'   => $type,
                'status' => $request->input('status', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type'         => ['required', 'in:lend,borrow'],
            'person_name'  => ['required', 'string', 'max:150'],
            'person_phone' => ['nullable', 'string', 'max:20'],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'note'         => ['nullable', 'string', 'max:500'],
            'loan_date'    => ['required', 'date'],
            'due_date'     => ['nullable', 'date', 'after_or_equal:loan_date'],
            'account_id'   => ['required', 'numeric', 'exists:accounts,id'],
        ]);

        DB::transaction(function () use ($data) {
            $loan = Loan::create([
                'type'         => $data['type'],
                'person_name'  => $data['person_name'],
                'person_phone' => $data['person_phone'] ?? null,
                'amount'       => $data['amount'],
                'note'         => $data['note'] ?? null,
                'loan_date'    => $data['loan_date'],
                'due_date'     => $data['due_date'] ?? null,
                'status'       => 'unpaid',
            ]);

            // Record the disbursement as a transaction
            $txnType = $data['type'] === 'lend' ? 'lend' : 'borrow';
            Transaction::create([
                'account_id'     => $data['account_id'],
                'type'           => $txnType,
                'amount'         => $data['amount'],
                'date'           => $data['loan_date'],
                'description'    => "Loan: {$data['person_name']}",
                'reference_type' => 'loan',
                'reference_id'   => $loan->id,
            ]);
        });

        return back()->with('success', 'Loan recorded.');
    }

    public function update(Request $request, Loan $loan): RedirectResponse
    {
        $data = $request->validate([
            'person_name'  => ['required', 'string', 'max:150'],
            'person_phone' => ['nullable', 'string', 'max:20'],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'note'         => ['nullable', 'string', 'max:500'],
            'loan_date'    => ['required', 'date'],
            'due_date'     => ['nullable', 'date', 'after_or_equal:loan_date'],
        ]);

        $loan->update($data);
        $loan->load('repaymentTransactions');
        $loan->syncStatus();

        return back()->with('success', 'Loan updated.');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        // Cascade: delete all linked repayment transactions too
        Transaction::withoutGlobalScopes()
            ->where('reference_type', 'loan')
            ->where('reference_id', $loan->id)
            ->delete();

        $loan->delete();

        return back()->with('success', 'Loan deleted.');
    }

    // ── Repayments (now backed by transactions) ───────────────────────────────

    public function storeRepayment(Request $request, Loan $loan): RedirectResponse
    {
        $data = $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01', "max:{$loan->outstanding}"],
            'note'           => ['nullable', 'string', 'max:255'],
            'repayment_date' => ['required', 'date'],
            'account_id'     => ['required', 'numeric', 'exists:accounts,id'],
        ]);

        $repayType = $loan->type === 'lend' ? 'lend_repayment' : 'borrow_repayment';

        DB::transaction(function () use ($data, $loan, $repayType) {
            Transaction::create([
                'account_id'     => $data['account_id'],
                'type'           => $repayType,
                'amount'         => $data['amount'],
                'date'           => $data['repayment_date'],
                'description'    => $data['note'] ?? "Repayment: {$loan->person_name}",
                'reference_type' => 'loan',
                'reference_id'   => $loan->id,
            ]);

            $loan->load('repaymentTransactions');
            $loan->syncStatus();
        });

        return back()->with('success', 'Payment recorded.');
    }

    public function destroyRepayment(Loan $loan, Transaction $repayment): RedirectResponse
    {
        abort_if($repayment->reference_type !== 'loan' || $repayment->reference_id !== $loan->id, 403);

        $repayment->delete();
        $loan->load('repaymentTransactions');
        $loan->syncStatus();

        return back()->with('success', 'Repayment removed.');
    }
}
