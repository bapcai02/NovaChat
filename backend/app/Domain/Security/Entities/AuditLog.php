<?php

namespace App\Domain\Security\Entities;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use User;


class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(App\Domain\User\Entities\User::class);
    }

    public function resource()
    {
        return $this->morphTo('resource', 'resource_type', 'resource_id');
    }

    // Scopes
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByResourceType($query, $resourceType)
    {
        return $query->where('resource_type', $resourceType);
    }

    public function scopeByResource($query, $resourceType, $resourceId)
    {
        return $query->where('resource_type', $resourceType)
                    ->where('resource_id', $resourceId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // Helper methods
    public function getChanges()
    {
        return [
            'old' => $this->old_values,
            'new' => $this->new_values,
            'changed_fields' => $this->getChangedFields(),
        ];
    }

    public function getChangedFields()
    {
        if (!$this->old_values || !$this->new_values) {
            return [];
        }

        $changed = [];
        foreach ($this->new_values as $key => $value) {
            if (!isset($this->old_values[$key]) || $this->old_values[$key] !== $value) {
                $changed[$key] = [
                    'old' => $this->old_values[$key] ?? null,
                    'new' => $value,
                ];
            }
        }

        return $changed;
    }

    public function isCreateAction()
    {
        return $this->action === 'create';
    }

    public function isUpdateAction()
    {
        return $this->action === 'update';
    }

    public function isDeleteAction()
    {
        return $this->action === 'delete';
    }

    public function getActionDescription()
    {
        $descriptions = [
            'create' => 'Created',
            'update' => 'Updated',
            'delete' => 'Deleted',
            'join' => 'Joined',
            'leave' => 'Left',
            'invite' => 'Invited',
            'kick' => 'Kicked',
            'ban' => 'Banned',
            'unban' => 'Unbanned',
            'pin' => 'Pinned',
            'unpin' => 'Unpinned',
            'archive' => 'Archived',
            'unarchive' => 'Unarchived',
        ];

        return $descriptions[$this->action] ?? ucfirst($this->action);
    }
}
