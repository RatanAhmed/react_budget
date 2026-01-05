<?php

use App\Traits\AuditableColumns;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAuditableColsToBaseTables extends Migration
{
    use AuditableColumns;

    private $tables = [
        'budgets',
        'expenses',
        'incomes',
        'savings',
        'categories',
        'menus',
    ];

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        foreach ($this->tables as $table_name) {
            Schema::table($table_name, function (Blueprint $table) {
                $this->addAuditingColumns($table);
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        foreach ($this->tables as $table_name) {
            Schema::table($table_name, function (Blueprint $table) {
                $this->dropAuditingColumns($table);
            });
        }
    }
}
