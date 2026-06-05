<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentGatewayController;
use App\Http\Controllers\PricingController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TaskCategoryController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Resume\ResumeController;
use App\Http\Controllers\Resume\ResumeTemplateController;
use App\Http\Controllers\Resume\ResumeSectionController;
use App\Http\Controllers\Resume\ResumeSkillController;
use App\Http\Controllers\Resume\ResumeLanguageController;
use App\Http\Controllers\Resume\ResumeSocialLinkController;
use App\Http\Controllers\Resume\ResumeDownloadController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\PlanController as AdminPlanController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [ServiceController::class, 'index']);
Route::get('/pricing', [PricingController::class, 'index'])->name('pricing');
Route::get('/services/{slug}', [ServiceController::class, 'show'])->name('services.show');

// Payment callbacks — outside CSRF
Route::match(['get', 'post'], '/payment/callback/{gateway}', [PaymentController::class, 'callback'])->name('payment.callback');
Route::post('/payment/ipn/{gateway}', [PaymentController::class, 'ipn'])->name('payment.ipn');

// Public resume
Route::get('/r/{slug}', [ResumeController::class, 'publicView'])->name('resume.public');
Route::get('/resume/{resume}/preview/render', [ResumeDownloadController::class, 'renderPreview'])
    ->name('resume.preview.render')
    ->middleware('signed');
Route::match(['get', 'post'], '/resume/{resume}/download/callback/{download}',
    [ResumeDownloadController::class, 'paymentCallback']
)->name('resume.download.callback');
Route::get('/resume/templates', [ResumeTemplateController::class, 'index'])->name('resume.templates');
Route::get('/resume/templates/{template}/preview', [ResumeTemplateController::class, 'preview'])->name('resume.templates.preview');

/*
|--------------------------------------------------------------------------
| Admin Routes  (auth + admin middleware)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'admin'])
    ->group(function () {

        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Users
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->name('users.update-role');
        Route::post('/users/{user}/subscription', [AdminUserController::class, 'grantSubscription'])->name('users.grant-subscription');
        Route::delete('/subscriptions/{subscription}', [AdminUserController::class, 'cancelSubscription'])->name('subscriptions.cancel');

        // Plans
        Route::get('/plans', [AdminPlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [AdminPlanController::class, 'store'])->name('plans.store');
        Route::patch('/plans/{plan}', [AdminPlanController::class, 'update'])->name('plans.update');
        Route::delete('/plans/{plan}', [AdminPlanController::class, 'destroy'])->name('plans.destroy');
        Route::post('/plans/{id}/restore', [AdminPlanController::class, 'restore'])->name('plans.restore');

        // Payment gateways (moved from user-accessible area)
        Route::resource('/payment-gateways', PaymentGatewayController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('payment-gateways');
        Route::post('/payment-gateways/{id}/restore', [PaymentGatewayController::class, 'restore'])->name('payment-gateways.restore');
    });

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Subscription management
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
    Route::post('/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');

    // Payment (user-facing)
    Route::get('/payment/gateways', [PaymentController::class, 'gateways'])->name('payment.gateways');
    Route::post('/payment/initiate', [PaymentController::class, 'initiate'])->name('payment.initiate');
    Route::get('/payment/transactions', [PaymentController::class, 'transactions'])->name('payment.transactions');
    Route::post('/payment/{transaction}/refund', [PaymentController::class, 'refund'])->name('payment.refund');

    // ── Budget Planner features (requires subscription: budget-planner) ──────
    Route::middleware('subscribed:budget-planner')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');

        // Accounts
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
        Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
        Route::post('/accounts/bulk', [AccountController::class, 'storeBulk'])->name('accounts.store.bulk');
        Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');

        // Transactions (replaces income + expense + savings)
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
        Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

        // Budget plans
        Route::resource('/budget', BudgetController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::post('/budget/bulk', [BudgetController::class, 'storeBulk'])->name('budget.store.bulk');

        // Categories
        Route::resource('/category', CategoryController::class)->only(['index', 'store', 'update', 'destroy']);

        // Loans (lend & borrow)
        Route::get('/loans', [LoanController::class, 'index'])->name('loans.index');
        Route::post('/loans', [LoanController::class, 'store'])->name('loans.store');
        Route::patch('/loans/{loan}', [LoanController::class, 'update'])->name('loans.update');
        Route::delete('/loans/{loan}', [LoanController::class, 'destroy'])->name('loans.destroy');
        Route::post('/loans/{loan}/repayments', [LoanController::class, 'storeRepayment'])->name('loans.repayments.store');
        Route::delete('/loans/{loan}/repayments/{repayment}', [LoanController::class, 'destroyRepayment'])->name('loans.repayments.destroy');
    });

    // ── Task Manager features (requires subscription: task-manager) ──────────
    Route::middleware('subscribed:task-manager')->group(function () {
        Route::post('/tasks/{task}/update-status', [TaskController::class, 'updateStatus'])->name('tasks.update-status');
        Route::resource('/tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('/task-categories', TaskCategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // ── Resume Builder features (requires subscription: resume-builder) ──────
    Route::middleware('subscribed:resume-builder')->prefix('resume')->group(function () {
        Route::get('/', [ResumeController::class, 'index'])->name('resume.index');
        Route::post('/', [ResumeController::class, 'store'])->name('resume.store');
        Route::get('/{resume}/edit', [ResumeController::class, 'edit'])->name('resume.edit');
        Route::patch('/{resume}', [ResumeController::class, 'update'])->name('resume.update');
        Route::delete('/{resume}', [ResumeController::class, 'destroy'])->name('resume.destroy');
        Route::patch('/{resume}/template', [ResumeController::class, 'changeTemplate'])->name('resume.change-template');

        Route::post('/{resume}/sections', [ResumeSectionController::class, 'store'])->name('resume.sections.store');
        Route::patch('/{resume}/sections/{section}', [ResumeSectionController::class, 'update'])->name('resume.sections.update');
        Route::delete('/{resume}/sections/{section}', [ResumeSectionController::class, 'destroy'])->name('resume.sections.destroy');
        Route::post('/{resume}/sections/{section}/items', [ResumeSectionController::class, 'storeItem'])->name('resume.sections.items.store');
        Route::patch('/{resume}/sections/{section}/items/{item}', [ResumeSectionController::class, 'updateItem'])->name('resume.sections.items.update');
        Route::delete('/{resume}/sections/{section}/items/{item}', [ResumeSectionController::class, 'destroyItem'])->name('resume.sections.items.destroy');

        Route::post('/{resume}/skills', [ResumeSkillController::class, 'store'])->name('resume.skills.store');
        Route::patch('/{resume}/skills/{skill}', [ResumeSkillController::class, 'update'])->name('resume.skills.update');
        Route::delete('/{resume}/skills/{skill}', [ResumeSkillController::class, 'destroy'])->name('resume.skills.destroy');
        Route::post('/{resume}/skills/sync', [ResumeSkillController::class, 'bulkSync'])->name('resume.skills.sync');

        Route::post('/{resume}/languages', [ResumeLanguageController::class, 'store'])->name('resume.languages.store');
        Route::delete('/{resume}/languages/{language}', [ResumeLanguageController::class, 'destroy'])->name('resume.languages.destroy');

        Route::post('/{resume}/social-links', [ResumeSocialLinkController::class, 'store'])->name('resume.social-links.store');
        Route::delete('/{resume}/social-links/{link}', [ResumeSocialLinkController::class, 'destroy'])->name('resume.social-links.destroy');

        Route::get('/{resume}/preview', [ResumeDownloadController::class, 'preview'])->name('resume.preview');
        Route::post('/{resume}/pay-download', [ResumeDownloadController::class, 'initiatePayment'])->name('resume.pay-download');
        Route::get('/{resume}/download', [ResumeDownloadController::class, 'download'])->name('resume.download');
        Route::post('/{resume}/reissue-token', [ResumeDownloadController::class, 'reissueToken'])->name('resume.reissue-token');
    });
});

require __DIR__.'/auth.php';
