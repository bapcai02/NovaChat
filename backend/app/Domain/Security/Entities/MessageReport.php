<?php

namespace App\Domain\Security\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;
use App\Domain\Message\Entities\Message;


class MessageReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'reported_by',
        'reason',
        'description',
        'status',
        'moderator_id',
        'resolution',
        'action_taken',
        'reviewed_at',
        'resolved_at',
        'evidence',
    ];

    protected $casts = [
        'evidence' => 'array',
        'reviewed_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    // Relationships
    public function message()
    {
        return $this->belongsTo(App\Domain\Message\Entities\Message::class);
    }

    public function reportedBy()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function moderator()
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }

    public function scopeByReason($query, $reason)
    {
        return $query->where('reason', $reason);
    }

    public function scopeByModerator($query, $moderatorId)
    {
        return $query->where('moderator_id', $moderatorId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Helper methods
    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isReviewed()
    {
        return $this->status === 'reviewed';
    }

    public function isResolved()
    {
        return $this->status === 'resolved';
    }

    public function isDismissed()
    {
        return $this->status === 'dismissed';
    }

    public function review($moderatorId, $resolution = null)
    {
        $this->update([
            'status' => 'reviewed',
            'moderator_id' => $moderatorId,
            'resolution' => $resolution,
            'reviewed_at' => now(),
        ]);
    }

    public function resolve($actionTaken = null, $resolution = null)
    {
        $this->update([
            'status' => 'resolved',
            'action_taken' => $actionTaken,
            'resolution' => $resolution,
            'resolved_at' => now(),
        ]);
    }

    public function dismiss($resolution = null)
    {
        $this->update([
            'status' => 'dismissed',
            'resolution' => $resolution,
            'resolved_at' => now(),
        ]);
    }

    public function getReasonDescription()
    {
        $reasons = [
            'spam' => 'Spam',
            'inappropriate' => 'Inappropriate Content',
            'harassment' => 'Harassment',
            'violence' => 'Violence',
            'misinformation' => 'Misinformation',
            'copyright' => 'Copyright Violation',
            'other' => 'Other',
        ];

        return $reasons[$this->reason] ?? $this->reason;
    }

    public function getActionDescription()
    {
        $actions = [
            'none' => 'No Action',
            'warning' => 'Warning Issued',
            'message_removed' => 'Message Removed',
            'user_muted' => 'User Muted',
            'user_suspended' => 'User Suspended',
            'user_banned' => 'User Banned',
        ];

        return $actions[$this->action_taken] ?? $this->action_taken;
    }
}
