<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use App\Models\LoanRepayment;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->input('type', 'lend'); // lend | borrow

        $loans = Loan::with('repayments')
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
                'repayments'   => $loan->repayments->map(fn ($r) => [
                    'id'              => $r->id,
                    'amount'          => $r->amount,
                    'note'            => $r->note,
                    'repayment_date'  => $r->repayment_date?->toDateString(),
                ]),
            ]);

        // Summary totals for the active tab
        $summary = [
            'total_amount'  => $loans->sum('amount'),
            'total_paid'    => $loans->sum('paid_amount'),
            'total_outstanding' => $loans->sum('outstanding'),
            'count_unpaid'  => $loans->where('status', 'unpaid')->count(),
            'count_partial' => $loans->where('status', 'partial')->count(),
            'count_paid'    => $loans->where('status', 'paid')->count(),
        ];

        return Inertia::render('Loan/Index', [
            'loans'   => $loans,
            'summary' => $summary,
            'filters' => [
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
        ]);

        Loan::create($data);

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
        $loan->load('repayments');
        $loan->syncStatus();

        return back()->with('success', 'Loan updated.');
    }

    public function destroy(Loan $loan): RedirectResponse
    {
        $loan->delete();

        return back()->with('success', 'Loan deleted.');
    }

    // ── Repayments ────────────────────────────────────────────────────────────

    public function storeRepayment(Request $request, Loan $loan): RedirectResponse
    {
        $data = $request->validate([
            'amount'          => ['required', 'numeric', 'min:0.01', "max:{$loan->outstanding}"],
            'note'            => ['nullable', 'string', 'max:255'],
            'repayment_date'  => ['required', 'date'],
        ]);

        $loan->repayments()->create($data);
        $loan->load('repayments');
        $loan->syncStatus();

        return back()->with('success', 'Payment recorded.');
    }

    public function destroyRepayment(Loan $loan, LoanRepayment $repayment): RedirectResponse
    {
        abort_if($repayment->loan_id !== $loan->id, 403);

        $repayment->delete();
        $loan->load('repayments');
        $loan->syncStatus();

        return back()->with('success', 'Repayment removed.');
    }
}
