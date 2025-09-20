<?php

namespace App\Helpers;

class AvatarHelper
{
    /**
     * Convert avatar path to full URL
     */
    public static function getFullUrl(?string $avatar): ?string
    {
        if (!$avatar) {
            return null;
        }

        // If it's already a full URL, return as is
        if (filter_var($avatar, FILTER_VALIDATE_URL)) {
            return $avatar;
        }

        // Remove /storage/ prefix if it exists
        if (strpos($avatar, '/storage/') === 0) {
            $avatar = substr($avatar, 9); // Remove '/storage/' (9 characters)
        }

        return 'http://localhost:8000/storage/' . $avatar;
    }
}
