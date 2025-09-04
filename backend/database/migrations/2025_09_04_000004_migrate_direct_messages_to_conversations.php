<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('direct_messages')) {
            return;
        }

        // Build pairs from existing direct_messages
        $pairs = DB::table('direct_messages')
            ->select('sender_id', 'receiver_id')
            ->get()
            ->map(function ($r) {
                $a = (int) $r->sender_id; $b = (int) $r->receiver_id;
                return $a < $b ? [$a, $b] : [$b, $a];
            })
            ->unique()
            ->values();

        foreach ($pairs as $pair) {
            [$a, $b] = $pair;
            $conversationId = DB::table('conversations')->insertGetId([
                'type' => 'direct',
                'team_id' => null,
                'name' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            // Members
            DB::table('conversation_members')->insert([
                [ 'conversation_id' => $conversationId, 'user_id' => $a, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now() ],
                [ 'conversation_id' => $conversationId, 'user_id' => $b, 'joined_at' => now(), 'created_at' => now(), 'updated_at' => now() ],
            ]);

            // Move DMs into messages table with conversation_id
            $dms = DB::table('direct_messages')
                ->where(function ($q) use ($a, $b) {
                    $q->where('sender_id', $a)->where('receiver_id', $b);
                })
                ->orWhere(function ($q) use ($a, $b) {
                    $q->where('sender_id', $b)->where('receiver_id', $a);
                })
                ->orderBy('id')
                ->get();

            foreach ($dms as $dm) {
                DB::table('messages')->insert([
                    'channel_id' => null,
                    'conversation_id' => $conversationId,
                    'user_id' => (int) $dm->sender_id,
                    'parent_id' => null,
                    'content' => (string) $dm->content,
                    'type' => (string) ($dm->type ?? 'text'),
                    'metadata' => json_encode([]),
                    'is_edited' => false,
                    'is_pinned' => false,
                    'is_deleted' => (bool) ($dm->is_deleted ?? false),
                    'created_at' => $dm->created_at ?? now(),
                    'updated_at' => $dm->updated_at ?? now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // No-op: do not attempt to reverse data migration
    }
};


