<?php

use App\Traits\AuditableColumns;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    use AuditableColumns;

    public function up(): void
    {
        Schema::create('ai_platforms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('website')->nullable();
            $table->string('category')->nullable()->comment('e.g. Chat, Image, Code, Search');
            $table->enum('token_reset', ['monthly', 'weekly', 'daily', 'none'])->default('monthly');
            $table->string('description')->nullable();
            $table->string('icon_url')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();
            $this->addAuditingColumns($table);
        });

        // Seed the platforms that were previously hardcoded in JS
        $now = now();
        DB::table('ai_platforms')->insert([
            ['name' => 'ChatGPT',             'website' => 'https://chat.openai.com',      'category' => 'Chat',   'token_reset' => 'monthly', 'description' => 'OpenAI conversational AI',         'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Google Gemini',        'website' => 'https://gemini.google.com',    'category' => 'Chat',   'token_reset' => 'monthly', 'description' => 'Google Gemini AI assistant',       'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Claude (Anthropic)',   'website' => 'https://claude.ai',            'category' => 'Chat',   'token_reset' => 'monthly', 'description' => 'Anthropic Claude',                 'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Microsoft Copilot',   'website' => 'https://copilot.microsoft.com','category' => 'Chat',   'token_reset' => 'monthly', 'description' => 'Microsoft AI Copilot',             'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Midjourney',           'website' => 'https://midjourney.com',       'category' => 'Image',  'token_reset' => 'monthly', 'description' => 'AI image generation',              'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Perplexity',           'website' => 'https://perplexity.ai',        'category' => 'Search', 'token_reset' => 'monthly', 'description' => 'AI-powered search engine',         'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'GitHub Copilot',       'website' => 'https://github.com/features/copilot', 'category' => 'Code', 'token_reset' => 'monthly', 'description' => 'AI pair programmer',        'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Notion AI',            'website' => 'https://notion.so',            'category' => 'Productivity', 'token_reset' => 'monthly', 'description' => 'AI inside Notion',         'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Grok',                 'website' => 'https://grok.x.ai',            'category' => 'Chat',   'token_reset' => 'monthly', 'description' => 'xAI Grok assistant',               'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Other',                'website' => null,                           'category' => null,     'token_reset' => 'monthly', 'description' => 'Any other AI platform',            'icon_url' => null, 'status' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_platforms');
    }
};
