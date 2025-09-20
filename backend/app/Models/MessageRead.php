<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

class MessageRead extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_id',
        'user_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the message that this read status belongs to.
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Get the user that this read status belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark a message as read for a user.
     */
    public static function markAsRead(int $messageId, int $userId): void
    {
        static::where('message_id', $messageId)
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Mark all messages in a conversation as read for a user.
     */
    public static function markConversationAsRead(int $conversationId, int $userId): void
    {
        Log::info('Marking conversation as read', ['conversationId' => $conversationId, 'userId' => $userId]);
        static::whereHas('message', function ($query) use ($conversationId) {
            $query->where('conversation_id', $conversationId);
        })
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Create read status entries for all conversation members when a new message is created.
     */
    public static function createForNewMessage(int $messageId, int $conversationId, int $senderId): void
    {
        $memberIds = ConversationMember::where('conversation_id', $conversationId)
            ->where('user_id', '!=', $senderId)
            ->pluck('user_id');

        foreach ($memberIds as $memberId) {
            static::create([
                'message_id' => $messageId,
                'user_id' => $memberId,
                'read_at' => null,
            ]);
        }
    }

    /**
     * Get unread count for a specific conversation and user.
     */
    public static function getUnreadCount(int $conversationId, int $userId): int
    {
        return static::whereHas('message', function ($query) use ($conversationId) {
            $query->where('conversation_id', $conversationId);
        })
            ->where('user_id', $userId)
            ->count();
    }

    /**
     * Get unread counts for all conversations for a user.
     */
    public static function getUnreadCountsForUser(int $userId): array
    {
        return static::selectRaw('
            m.conversation_id,
            COUNT(*) as unread_count
        ')
            ->from('message_reads as mr')
            ->join('messages as m', 'mr.message_id', '=', 'm.id')
            ->where('mr.user_id', $userId)
            ->groupBy('m.conversation_id')
            ->pluck('unread_count', 'conversation_id')
            ->toArray();
    }

    /**
     * Readers of a message computed from complement of unread rows.
     * Since we delete read rows, any member without a row for this message is a reader.
     * read_at is not tracked after deletion, so it will be null.
     *
     * @return array<int, array{id:int,name:string,username?:string,avatar?:string,read_at:string|null}>
     */
    public static function getReadersForMessage(int $conversationId, int $messageId, ?int $senderId = null): array
    {
        $memberIds = ConversationMember::where('conversation_id', $conversationId)
            ->pluck('user_id')
            ->toArray();

        if ($senderId) {
            $memberIds = array_filter($memberIds, fn ($id) => (int) $id !== (int) $senderId);
        }
        if (empty($memberIds)) {
            return [];
        }

        $unreadUserIds = static::where('message_id', $messageId)
            ->whereIn('user_id', $memberIds)
            ->pluck('user_id')
            ->toArray();

        $readIds = array_values(array_diff($memberIds, $unreadUserIds));
        if (empty($readIds)) {
            return [];
        }

        $users = User::whereIn('id', $readIds)->get(['id', 'name', 'username', 'avatar']);

        return $users->map(function ($u) {
            return [
                'id' => (int) $u->id,
                'name' => (string) $u->name,
                'username' => $u->username,
                'avatar' => $u->avatar,
                'read_at' => null,
            ];
        })->toArray();
    }
}
