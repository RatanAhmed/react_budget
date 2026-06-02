<?php

namespace App\Policies;

use App\Models\Resume\Resume;
use App\Models\User;

class ResumePolicy
{
    /**
     * Only the owner can view/edit/download their resume.
     */
    public function view(User $user, Resume $resume): bool
    {
        return $resume->created_by === $user->id;
    }
}
