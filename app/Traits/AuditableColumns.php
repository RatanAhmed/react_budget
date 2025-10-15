<?php

namespace App\Traits;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

trait AuditableColumns
{
    public function addAuditingColumns(Blueprint $table)
    {
        if (!Schema::hasColumn($table->getTable(), 'created_by')) {
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users');
        }

        if (!Schema::hasColumn($table->getTable(), 'updated_by')) {
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->foreign('updated_by')->references('id')->on('users');
        }

        if (!Schema::hasColumn($table->getTable(), 'deleted_by')) {
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->foreign('deleted_by')->references('id')->on('users');
        }

        if (!Schema::hasColumn($table->getTable(), 'deleted_at')) {
            $table->softDeletes();
        }
    }

    public function dropAuditingColumns(Blueprint $table)
    {
        if (Schema::hasColumn($table->getTable(), 'created_by')) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        }

        if (Schema::hasColumn($table->getTable(), 'updated_by')) {
            $table->dropForeign(['updated_by']);
            $table->dropColumn('updated_by');
        }

        if (Schema::hasColumn($table->getTable(), 'deleted_by')) {
            $table->dropForeign(['deleted_by']);
            $table->dropColumn('deleted_by');
        }

        if (Schema::hasColumn($table->getTable(), 'deleted_at')) {
            $table->dropSoftDeletes();
        }
    }
}
