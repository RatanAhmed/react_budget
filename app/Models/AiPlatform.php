<?php

namespace App\Models;

use App\Traits\AuditUserActions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * AI platforms are global (not per-user) — no AuthUserScope.
 * Any authenticated user can read; admin can manage via web CRUD.
 */
class AiPlatform extends Model
{
    use HasFactory, AuditUserActions;

    protected $fillable = [
        'name',
        'website',
        'category',
        'token_reset',
        'description',
        'icon_url',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    // ── New agents discovery ──────────────────────────────────────────────────

    /**
     * Curated list of recently launched / notable AI agents with free-tier info.
     * Filtered to exclude platforms already in the database.
     *
     * GET /ai-platforms/new-agents?q=&category=
     */
    public static function newlyLaunched(): array
    {
        return [
            // ── Chat / Assistant ──────────────────────────────────────────────
            ['name'=>'ChatGPT',          'website'=>'https://chat.openai.com',           'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2022-11', 'free_tier'=>true,  'free_details'=>'Free plan with GPT-4o mini; ChatGPT Plus $20/mo for GPT-4o',                  'description'=>'OpenAI flagship conversational AI'],
            ['name'=>'Google Gemini',    'website'=>'https://gemini.google.com',         'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2023-12', 'free_tier'=>true,  'free_details'=>'Free with Gemini 1.5 Flash; Gemini Advanced $19.99/mo',                      'description'=>'Google multimodal AI assistant'],
            ['name'=>'Claude',           'website'=>'https://claude.ai',                 'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2023-03', 'free_tier'=>true,  'free_details'=>'Free tier with daily message limits; Pro $20/mo',                             'description'=>'Anthropic Claude — thoughtful, safe assistant'],
            ['name'=>'Microsoft Copilot','website'=>'https://copilot.microsoft.com',     'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2023-02', 'free_tier'=>true,  'free_details'=>'Free with limited daily usage; Copilot Pro $20/mo',                          'description'=>'Microsoft AI powered by GPT-4o'],
            ['name'=>'Grok',             'website'=>'https://grok.com',                  'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2023-11', 'free_tier'=>true,  'free_details'=>'Free on X; SuperGrok $30/mo for higher limits',                               'description'=>'xAI assistant with real-time web access'],
            ['name'=>'Mistral Le Chat',  'website'=>'https://chat.mistral.ai',           'category'=>'Chat',        'token_reset'=>'none',    'launched'=>'2024-02', 'free_tier'=>true,  'free_details'=>'Fully free; Pro €14.99/mo',                                                   'description'=>'Mistral AI chat interface — very fast'],
            ['name'=>'DeepSeek',         'website'=>'https://chat.deepseek.com',         'category'=>'Chat',        'token_reset'=>'none',    'launched'=>'2024-01', 'free_tier'=>true,  'free_details'=>'Completely free to use',                                                      'description'=>'Chinese open-source model, strong at coding & reasoning'],
            ['name'=>'Meta AI',          'website'=>'https://meta.ai',                   'category'=>'Chat',        'token_reset'=>'none',    'launched'=>'2024-04', 'free_tier'=>true,  'free_details'=>'Completely free; integrated into WhatsApp, Instagram, Facebook',              'description'=>'Meta Llama-powered assistant'],
            ['name'=>'Perplexity',       'website'=>'https://perplexity.ai',             'category'=>'Search',      'token_reset'=>'monthly', 'launched'=>'2022-12', 'free_tier'=>true,  'free_details'=>'Free with standard model; Pro $20/mo for GPT-4o & Claude',                   'description'=>'AI-powered answer engine with citations'],
            ['name'=>'You.com',          'website'=>'https://you.com',                   'category'=>'Search',      'token_reset'=>'monthly', 'launched'=>'2022-09', 'free_tier'=>true,  'free_details'=>'Free with daily limits; Pro $15/mo',                                          'description'=>'AI search with personalised answers'],
            ['name'=>'Character.AI',     'website'=>'https://character.ai',              'category'=>'Chat',        'token_reset'=>'monthly', 'launched'=>'2022-09', 'free_tier'=>true,  'free_details'=>'Free with speed limits; c.ai+ $9.99/mo',                                     'description'=>'Roleplay and custom AI personas'],
            ['name'=>'Pi',               'website'=>'https://pi.ai',                     'category'=>'Chat',        'token_reset'=>'none',    'launched'=>'2023-05', 'free_tier'=>true,  'free_details'=>'Completely free',                                                             'description'=>'Inflection AI personal assistant — conversational focus'],
            ['name'=>'HuggingChat',      'website'=>'https://huggingface.co/chat',       'category'=>'Chat',        'token_reset'=>'none',    'launched'=>'2023-04', 'free_tier'=>true,  'free_details'=>'Completely free; open-source models',                                         'description'=>'HuggingFace open chat with multiple models'],
            ['name'=>'Copilot+ (Recall)','website'=>'https://blogs.windows.com/windows-experience', 'category'=>'Productivity','token_reset'=>'none','launched'=>'2024-06','free_tier'=>false,'free_details'=>'Requires Copilot+ PC hardware — no separate subscription',               'description'=>'Windows Recall AI on Copilot+ PCs'],

            // ── Code ─────────────────────────────────────────────────────────
            ['name'=>'GitHub Copilot',   'website'=>'https://github.com/features/copilot','category'=>'Code',       'token_reset'=>'monthly', 'launched'=>'2022-06', 'free_tier'=>true,  'free_details'=>'Free for students & OSS maintainers; $10/mo individual',                     'description'=>'AI pair programmer inside VS Code & JetBrains'],
            ['name'=>'Cursor',           'website'=>'https://cursor.sh',                 'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2023-03', 'free_tier'=>true,  'free_details'=>'Hobby free (2000 completions); Pro $20/mo',                                   'description'=>'AI-first code editor forked from VS Code'],
            ['name'=>'Windsurf',         'website'=>'https://codeium.com/windsurf',      'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2024-11', 'free_tier'=>true,  'free_details'=>'Free tier with limited flows; Pro $15/mo',                                    'description'=>'Codeium agentic IDE with "Flows" AI agent'],
            ['name'=>'Codeium',          'website'=>'https://codeium.com',               'category'=>'Code',        'token_reset'=>'none',    'launched'=>'2022-12', 'free_tier'=>true,  'free_details'=>'Completely free for individuals',                                             'description'=>'Free AI code completion — supports 70+ languages'],
            ['name'=>'Tabnine',          'website'=>'https://tabnine.com',               'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2019-08', 'free_tier'=>true,  'free_details'=>'Free basic; Pro $12/mo',                                                      'description'=>'Privacy-first AI code assistant'],
            ['name'=>'Amazon Q Developer','website'=>'https://aws.amazon.com/q/developer','category'=>'Code',       'token_reset'=>'monthly', 'launched'=>'2023-11', 'free_tier'=>true,  'free_details'=>'Free tier with 50 agent interactions/mo; Pro $19/mo',                        'description'=>'AWS AI code assistant for cloud developers'],
            ['name'=>'Gemini Code Assist','website'=>'https://cloud.google.com/gemini',  'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2024-04', 'free_tier'=>true,  'free_details'=>'Free for individuals; Team $19/mo',                                           'description'=>'Google Cloud AI for coding in IDEs'],
            ['name'=>'Replit AI',        'website'=>'https://replit.com',                'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2023-09', 'free_tier'=>true,  'free_details'=>'Free Starter; Core $25/mo',                                                   'description'=>'AI agent that builds, deploys, and iterates full apps'],
            ['name'=>'Bolt.new',         'website'=>'https://bolt.new',                  'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2024-10', 'free_tier'=>true,  'free_details'=>'150k tokens/day free; Pro $20/mo',                                            'description'=>'StackBlitz browser-based AI full-stack builder'],
            ['name'=>'v0 by Vercel',     'website'=>'https://v0.dev',                    'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2023-09', 'free_tier'=>true,  'free_details'=>'Free with limited generations; $20/mo Premium',                               'description'=>'AI generates React/shadcn UI from prompts'],
            ['name'=>'Lovable',          'website'=>'https://lovable.dev',               'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2024-09', 'free_tier'=>true,  'free_details'=>'Free 5 projects; Starter $20/mo',                                             'description'=>'AI full-stack app builder — formerly GPT Engineer'],
            ['name'=>'Devin',            'website'=>'https://devin.ai',                  'category'=>'Code',        'token_reset'=>'monthly', 'launched'=>'2024-03', 'free_tier'=>false, 'free_details'=>'No free tier; $500/mo for 250 ACU',                                           'description'=>'First fully autonomous AI software engineer by Cognition'],
            ['name'=>'OpenHands',        'website'=>'https://github.com/All-Hands-AI/OpenHands','category'=>'Code', 'token_reset'=>'none',    'launched'=>'2024-04', 'free_tier'=>true,  'free_details'=>'Open source, self-hostable for free',                                         'description'=>'Open-source autonomous AI coding agent (formerly OpenDevin)'],

            // ── Image ─────────────────────────────────────────────────────────
            ['name'=>'Midjourney',       'website'=>'https://midjourney.com',            'category'=>'Image',       'token_reset'=>'monthly', 'launched'=>'2022-07', 'free_tier'=>false, 'free_details'=>'No free tier; Basic $10/mo',                                                  'description'=>'High-quality AI image generation via Discord/Web'],
            ['name'=>'DALL·E 3',         'website'=>'https://openai.com/dall-e-3',       'category'=>'Image',       'token_reset'=>'monthly', 'launched'=>'2023-10', 'free_tier'=>true,  'free_details'=>'Free via ChatGPT free plan (limited); API pay-per-use',                       'description'=>'OpenAI text-to-image, integrated in ChatGPT'],
            ['name'=>'Adobe Firefly',    'website'=>'https://firefly.adobe.com',         'category'=>'Image',       'token_reset'=>'monthly', 'launched'=>'2023-03', 'free_tier'=>true,  'free_details'=>'25 generative credits/mo free; Premium in CC plan',                          'description'=>'Adobe AI image & creative tool — commercially safe'],
            ['name'=>'Stable Diffusion', 'website'=>'https://stability.ai',              'category'=>'Image',       'token_reset'=>'none',    'launched'=>'2022-08', 'free_tier'=>true,  'free_details'=>'Open source — free to self-host',                                             'description'=>'Open-source diffusion model'],
            ['name'=>'Ideogram',         'website'=>'https://ideogram.ai',               'category'=>'Image',       'token_reset'=>'monthly', 'launched'=>'2023-09', 'free_tier'=>true,  'free_details'=>'10 free images/day; Basic $8/mo',                                             'description'=>'AI image generation with excellent text rendering'],
            ['name'=>'Runway',           'website'=>'https://runwayml.com',              'category'=>'Image',       'token_reset'=>'monthly', 'launched'=>'2023-03', 'free_tier'=>true,  'free_details'=>'Free 125 credits on signup; Standard $15/mo',                                 'description'=>'AI creative suite — image, video & more'],
            ['name'=>'Leonardo.AI',      'website'=>'https://leonardo.ai',               'category'=>'Image',       'token_reset'=>'daily',   'launched'=>'2023-02', 'free_tier'=>true,  'free_details'=>'150 free tokens/day (reset daily); Apprentice $12/mo',                       'description'=>'Game-asset focused AI image generator'],
            ['name'=>'Flux',             'website'=>'https://blackforestlabs.ai',        'category'=>'Image',       'token_reset'=>'none',    'launched'=>'2024-08', 'free_tier'=>true,  'free_details'=>'FLUX.1 Schnell open-weight model — free to use',                              'description'=>'Black Forest Labs new generation image model'],

            // ── Video ─────────────────────────────────────────────────────────
            ['name'=>'Sora',             'website'=>'https://sora.com',                  'category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2024-12', 'free_tier'=>true,  'free_details'=>'Free with watermark (50 videos/mo); Plus $20/mo',                             'description'=>'OpenAI text-to-video model'],
            ['name'=>'Kling AI',         'website'=>'https://klingai.com',               'category'=>'Video',       'token_reset'=>'daily',   'launched'=>'2024-06', 'free_tier'=>true,  'free_details'=>'66 free credits/day; Standard $9.99/mo',                                      'description'=>'Kuaishou AI video generation — cinematic quality'],
            ['name'=>'Runway Gen-3',     'website'=>'https://runwayml.com',              'category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2024-06', 'free_tier'=>true,  'free_details'=>'Free 125 credits on signup; Standard $15/mo',                                 'description'=>'Runway Gen-3 Alpha video generation'],
            ['name'=>'Pika 2.0',         'website'=>'https://pika.art',                  'category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2024-12', 'free_tier'=>true,  'free_details'=>'Free plan with watermark; Basic $8/mo',                                       'description'=>'AI video generation with scene editing'],
            ['name'=>'HeyGen',           'website'=>'https://heygen.com',                'category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2022-09', 'free_tier'=>true,  'free_details'=>'1 free credit/mo; Creator $29/mo',                                            'description'=>'AI avatar video generation for marketing'],
            ['name'=>'Luma Dream Machine','website'=>'https://lumalabs.ai/dream-machine','category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2024-06', 'free_tier'=>true,  'free_details'=>'30 free generations/mo; Plus $29.99/mo',                                      'description'=>'Luma AI video from text or image'],
            ['name'=>'Veo 2',            'website'=>'https://deepmind.google/veo',       'category'=>'Video',       'token_reset'=>'monthly', 'launched'=>'2024-12', 'free_tier'=>true,  'free_details'=>'Free via VideoFX waitlist; API pricing TBA',                                  'description'=>'Google DeepMind state-of-the-art video model'],

            // ── Audio ─────────────────────────────────────────────────────────
            ['name'=>'ElevenLabs',       'website'=>'https://elevenlabs.io',             'category'=>'Audio',       'token_reset'=>'monthly', 'launched'=>'2023-01', 'free_tier'=>true,  'free_details'=>'10k chars/mo free; Starter $5/mo',                                            'description'=>'Ultra-realistic AI voice cloning & text-to-speech'],
            ['name'=>'Suno',             'website'=>'https://suno.ai',                   'category'=>'Audio',       'token_reset'=>'daily',   'launched'=>'2024-03', 'free_tier'=>true,  'free_details'=>'50 free credits/day; Pro $8/mo',                                              'description'=>'AI music generation from text prompts'],
            ['name'=>'Udio',             'website'=>'https://udio.com',                  'category'=>'Audio',       'token_reset'=>'monthly', 'launched'=>'2024-04', 'free_tier'=>true,  'free_details'=>'1200 free generations/mo; Standard $10/mo',                                   'description'=>'AI music creation — Suno competitor'],
            ['name'=>'NotebookLM',       'website'=>'https://notebooklm.google',         'category'=>'Audio',       'token_reset'=>'none',    'launched'=>'2023-07', 'free_tier'=>true,  'free_details'=>'Completely free; Plus in Google One AI Premium',                              'description'=>'Google AI notebook with podcast generation from docs'],
            ['name'=>'Murf AI',          'website'=>'https://murf.ai',                   'category'=>'Audio',       'token_reset'=>'monthly', 'launched'=>'2020-09', 'free_tier'=>true,  'free_details'=>'10 min free voice generation; Basic $29/mo',                                  'description'=>'AI voice studio for narration & voiceovers'],

            // ── Writing ───────────────────────────────────────────────────────
            ['name'=>'Jasper',           'website'=>'https://jasper.ai',                 'category'=>'Writing',     'token_reset'=>'monthly', 'launched'=>'2021-02', 'free_tier'=>true,  'free_details'=>'7-day free trial; Creator $49/mo',                                            'description'=>'AI content writer for marketing teams'],
            ['name'=>'Copy.ai',          'website'=>'https://copy.ai',                   'category'=>'Writing',     'token_reset'=>'monthly', 'launched'=>'2020-10', 'free_tier'=>true,  'free_details'=>'Free plan with 2000 words/mo; Pro $49/mo',                                    'description'=>'AI copy and content generation'],
            ['name'=>'Writesonic',       'website'=>'https://writesonic.com',            'category'=>'Writing',     'token_reset'=>'monthly', 'launched'=>'2021-01', 'free_tier'=>true,  'free_details'=>'Free 10k words trial; Small Team $19/mo',                                     'description'=>'AI writer and SEO content platform'],
            ['name'=>'Notion AI',        'website'=>'https://notion.so/ai',              'category'=>'Productivity','token_reset'=>'monthly', 'launched'=>'2023-02', 'free_tier'=>false, 'free_details'=>'Requires Notion plan; add-on $10/mo/member',                                  'description'=>'AI writing assistant embedded in Notion'],

            // ── Productivity / Agents ─────────────────────────────────────────
            ['name'=>'Microsoft 365 Copilot','website'=>'https://www.microsoft.com/en-us/microsoft-365/copilot', 'category'=>'Productivity','token_reset'=>'monthly','launched'=>'2023-11','free_tier'=>false,'free_details'=>'$30/user/mo (requires M365 subscription)',              'description'=>'AI in Word, Excel, Outlook, Teams'],
            ['name'=>'NotebookLM Plus',  'website'=>'https://notebooklm.google',         'category'=>'Productivity','token_reset'=>'monthly', 'launched'=>'2024-10', 'free_tier'=>false, 'free_details'=>'Included in Google One AI Premium $19.99/mo',                                 'description'=>'Extended NotebookLM with higher limits'],
            ['name'=>'Zapier AI',        'website'=>'https://zapier.com/ai',              'category'=>'Productivity','token_reset'=>'monthly', 'launched'=>'2024-03', 'free_tier'=>true,  'free_details'=>'Free tier on Zapier Free plan; usage-based scaling',                         'description'=>'AI automation agent inside Zapier workflows'],
            ['name'=>'Lindy AI',         'website'=>'https://lindy.ai',                  'category'=>'Productivity','token_reset'=>'monthly', 'launched'=>'2024-01', 'free_tier'=>true,  'free_details'=>'400 free tasks/mo; Basic $49.99/mo',                                          'description'=>'Personal AI agent for email, calendar, workflows'],
            ['name'=>'Otter.ai',         'website'=>'https://otter.ai',                  'category'=>'Productivity','token_reset'=>'monthly', 'launched'=>'2018-02', 'free_tier'=>true,  'free_details'=>'300 min/mo transcription free; Pro $16.99/mo',                               'description'=>'AI meeting transcription and notes'],
        ];
    }

    // ── Suggestions (typeahead) ───────────────────────────────────────────────

    /**
     * Well-known AI platforms not yet in the database, used to populate
     * the "did you mean…" suggestion list when creating new platforms.
     */
    public static function wellKnown(): array
    {
        return [
            ['name' => 'Runway',        'website' => 'https://runwayml.com',         'category' => 'Image',       'token_reset' => 'monthly'],
            ['name' => 'Stable Diffusion','website'=> 'https://stability.ai',         'category' => 'Image',       'token_reset' => 'none'],
            ['name' => 'DALL·E',         'website' => 'https://openai.com/dall-e',    'category' => 'Image',       'token_reset' => 'monthly'],
            ['name' => 'ElevenLabs',     'website' => 'https://elevenlabs.io',        'category' => 'Audio',       'token_reset' => 'monthly'],
            ['name' => 'Suno',           'website' => 'https://suno.ai',              'category' => 'Audio',       'token_reset' => 'monthly'],
            ['name' => 'Udio',           'website' => 'https://udio.com',             'category' => 'Audio',       'token_reset' => 'monthly'],
            ['name' => 'Pika',           'website' => 'https://pika.art',             'category' => 'Video',       'token_reset' => 'monthly'],
            ['name' => 'Kling AI',       'website' => 'https://klingai.com',          'category' => 'Video',       'token_reset' => 'monthly'],
            ['name' => 'HeyGen',         'website' => 'https://heygen.com',           'category' => 'Video',       'token_reset' => 'monthly'],
            ['name' => 'Cursor',         'website' => 'https://cursor.sh',            'category' => 'Code',        'token_reset' => 'monthly'],
            ['name' => 'Tabnine',        'website' => 'https://tabnine.com',          'category' => 'Code',        'token_reset' => 'monthly'],
            ['name' => 'Codeium',        'website' => 'https://codeium.com',          'category' => 'Code',        'token_reset' => 'none'],
            ['name' => 'Writesonic',     'website' => 'https://writesonic.com',       'category' => 'Writing',     'token_reset' => 'monthly'],
            ['name' => 'Copy.ai',        'website' => 'https://copy.ai',              'category' => 'Writing',     'token_reset' => 'monthly'],
            ['name' => 'Jasper',         'website' => 'https://jasper.ai',            'category' => 'Writing',     'token_reset' => 'monthly'],
            ['name' => 'Mistral',        'website' => 'https://mistral.ai',           'category' => 'Chat',        'token_reset' => 'monthly'],
            ['name' => 'DeepSeek',       'website' => 'https://deepseek.com',         'category' => 'Chat',        'token_reset' => 'monthly'],
            ['name' => 'Meta AI',        'website' => 'https://meta.ai',              'category' => 'Chat',        'token_reset' => 'none'],
            ['name' => 'Character.AI',   'website' => 'https://character.ai',         'category' => 'Chat',        'token_reset' => 'monthly'],
            ['name' => 'You.com',        'website' => 'https://you.com',              'category' => 'Search',      'token_reset' => 'monthly'],
        ];
    }
}
