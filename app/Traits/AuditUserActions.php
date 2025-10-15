<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\SoftDeletes;

trait AuditUserActions
{
    use SoftDeletes;
    protected static function boot()
    {
        parent::boot();
        // static::orderBy('name');
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
                $model->updated_by = Auth::id();
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = auth()->id();
            }
        });

        static::deleting(function ($model) {
            if (Auth::check()) {
                $model->deleted_by = Auth::id();
                if (!$model->isForceDeleting()) {
                    $model->save();
                }
            }
        });
    }
}
