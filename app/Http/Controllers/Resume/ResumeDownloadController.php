<?php

namespace App\Http\Controllers\Resume;

use App\Http\Controllers\Controller;
use App\Models\PaymentGateway;
use App\Models\PaymentTransaction;
use App\Models\Resume\Resume;
use App\Models\Resume\ResumeDownload;
use App\Services\Payment\PaymentService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class ResumeDownloadController extends Controller
{
    // Download price in BDT
    const DOWNLOAD_PRICE = 29.00;

    public function __construct(protected PaymentService $paymentService) {}

    // ── 1. Preview page (watermarked, anti-piracy) ────────────────────────────

    /**
     * Serve the preview via a time-limited signed URL.
     * The URL is generated server-side and expires in 30 minutes.
     * The HTML itself has CSS protections against copy/print/screenshot.
     */
    public function preview(Request $request, Resume $resume): Response
    {
        // Ensure the resume belongs to the authenticated user
        $this->authorize('view', $resume);

        $resume->load(['template', 'sections.items', 'skills', 'languages', 'socialLinks']);

        // Check if user has already paid for this resume
        $hasPaid = ResumeDownload::where('resume_id', $resume->id)
            ->where('user_id', auth()->id())
            ->where('status', 'paid')
            ->exists();

        // Generate a signed preview token (30 min expiry) — passed to frontend
        $previewToken = URL::temporarySignedRoute(
            'resume.preview.render',
            now()->addMinutes(30),
            ['resume' => $resume->id]
        );

        $gateways = PaymentGateway::active()->get(['id', 'name', 'slug', 'logo', 'color', 'description', 'is_sandbox', 'settings']);

        return Inertia::render('Resume/Preview', [
            'resume'       => $resume,
            'hasPaid'      => $hasPaid,
            'previewToken' => $previewToken,
            'price'        => self::DOWNLOAD_PRICE,
            'gateways'     => $gateways,
        ]);
    }

    /**
     * Render the actual resume HTML (called inside an iframe via signed URL).
     * Applies watermark + CSS anti-piracy protections.
     */
    public function renderPreview(Request $request, Resume $resume)
    {
        // Validate the signed URL — abort if tampered or expired
        if (! $request->hasValidSignature()) {
            abort(403, 'Preview link has expired. Please refresh the page.');
        }

        $resume->load(['template', 'sections.items', 'skills', 'languages', 'socialLinks']);

        $style  = $resume->template->style_config ?? [];
        $layout = $resume->template->layout ?? 'single-column';

        return response()->view('resume.preview.document', [
            'resume'  => $resume,
            'style'   => $style,
            'layout'  => $layout,
            'watermark' => auth()->user()->name . ' · Preview Only · ' . now()->format('d M Y'),
        ])->header('Cache-Control', 'no-store, no-cache, must-revalidate')
          ->header('X-Frame-Options', 'SAMEORIGIN')
          ->header('Content-Security-Policy', "frame-ancestors 'self'");
    }

    // ── 2. Initiate payment for download ─────────────────────────────────────

    public function initiatePayment(Request $request, Resume $resume)
    {
        $this->authorize('view', $resume);

        $validated = $request->validate([
            'gateway' => 'required|string|exists:payment_gateways,slug',
            'format'  => 'nullable|in:pdf',
            'phone'   => 'nullable|string|max:20',
        ]);

        // Check if already paid — don't charge twice
        $existing = ResumeDownload::where('resume_id', $resume->id)
            ->where('user_id', auth()->id())
            ->where('status', 'paid')
            ->first();

        if ($existing) {
            $token = $existing->issueToken();
            return response()->json([
                'status'         => 'already_paid',
                'download_token' => $token,
                'message'        => 'You already purchased this resume. Download link ready.',
            ]);
        }

        // Create a pending download record
        $download = ResumeDownload::create([
            'resume_id'   => $resume->id,
            'user_id'     => auth()->id(),
            'format'      => $validated['format'] ?? 'pdf',
            'amount_paid' => self::DOWNLOAD_PRICE,
            'status'      => 'pending',
        ]);

        try {
            $result = $this->paymentService
                ->via($validated['gateway'])
                ->initiate([
                    'amount'           => self::DOWNLOAD_PRICE,
                    'phone'            => $validated['phone'] ?? null,
                    'note'             => "Resume Download: {$resume->title}",
                    'payable_type'     => ResumeDownload::class,
                    'payable_id'       => $download->id,
                    'user_id'          => auth()->id(),
                    'customer_name'    => auth()->user()->name,
                    'customer_email'   => auth()->user()->email,
                    'product_category' => 'Resume',
                    'callback_url'     => route('resume.download.callback', [
                        'resume'   => $resume->id,
                        'download' => $download->id,
                    ]),
                ]);

            $download->update(['transaction_id' => $result['transaction']->id]);

            return response()->json([
                'status'       => 'redirect',
                'txn_id'       => $result['transaction']->txn_id,
                'redirect_url' => $result['redirect_url'],
            ]);

        } catch (\Throwable $e) {
            $download->delete();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 422);
        }
    }

    // ── 3. Payment callback — mark download as paid ───────────────────────────

    public function paymentCallback(Request $request, Resume $resume, ResumeDownload $download)
    {
        $transaction = $download->transaction;

        if (! $transaction) {
            return Inertia::render('Resume/DownloadResult', [
                'success' => false,
                'message' => 'Transaction not found.',
                'resume'  => $resume->only('id', 'title', 'slug'),
            ]);
        }

        $callbackData = array_merge($request->query(), $request->post());

        $success = $this->paymentService
            ->via($transaction->gateway_slug)
            ->verify($transaction, $callbackData);

        if ($success) {
            $download->update(['status' => 'paid']);
            $token = $download->issueToken();

            return Inertia::render('Resume/DownloadResult', [
                'success'        => true,
                'download_token' => $token,
                'resume'         => $resume->only('id', 'title', 'slug'),
                'txn_id'         => $transaction->txn_id,
                'amount'         => $transaction->amount,
                'gateway'        => $transaction->gateway_slug,
                'paid_at'        => $transaction->paid_at?->toDateTimeString(),
            ]);
        }

        return Inertia::render('Resume/DownloadResult', [
            'success' => false,
            'message' => 'Payment could not be verified. Please contact support.',
            'resume'  => $resume->only('id', 'title', 'slug'),
        ]);
    }

    // ── 4. Serve the PDF (one-time token, streams directly) ──────────────────

    public function download(Request $request, Resume $resume)
    {
        $token = $request->query('token');

        if (! $token) {
            abort(403, 'Download token required.');
        }

        // Find the download record by token
        $download = ResumeDownload::where('resume_id', $resume->id)
            ->where('user_id', auth()->id())
            ->where('download_token', $token)
            ->where('status', 'paid')
            ->first();

        if (! $download || ! $download->hasValidToken()) {
            abort(403, 'Download link has expired or is invalid. Please request a new one.');
        }

        // Load all resume data
        $resume->load(['template', 'sections.items', 'skills', 'languages', 'socialLinks']);

        // Generate PDF
        $pdf = Pdf::loadView('resume.pdf.document', ['resume' => $resume])
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled'      => false,
                'defaultFont'          => 'DejaVu Sans',
                'dpi'                  => 150,
            ]);

        // Invalidate the token after use (one-time download)
        $download->update([
            'download_token'   => null,
            'token_expires_at' => null,
            'downloaded_at'    => now(),
        ]);

        $filename = str($resume->full_name)->slug('-') . '-resume.pdf';

        return $pdf->download($filename);
    }

    // ── 5. Re-issue a download token (for already-paid users) ────────────────

    public function reissueToken(Resume $resume)
    {
        $this->authorize('view', $resume);

        $download = ResumeDownload::where('resume_id', $resume->id)
            ->where('user_id', auth()->id())
            ->where('status', 'paid')
            ->latest()
            ->first();

        if (! $download) {
            return response()->json(['status' => 'error', 'message' => 'No paid download found for this resume.'], 403);
        }

        $token = $download->issueToken();

        return response()->json([
            'status'         => 'ok',
            'download_token' => $token,
        ]);
    }
}
