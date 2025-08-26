<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DirectMessageSeeder extends Seeder
{
    public function run(): void
    {
        $pairs = [ [1,2], [1,3], [2,3] ];
        foreach ($pairs as [$a,$b]) {
            $conversationId = DB::table('direct_messages')->insertGetId([
                'user_one_id' => $a,
                'user_two_id' => $b,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            for ($i = 0; $i < 15; $i++) {
                DB::table('messages')->insert([
                    'channel_id' => 0, // not used for DMs
                    'user_id' => $i % 2 === 0 ? $a : $b,
                    'parent_id' => null,
                    'content' => 'DM message #'.($i+1).' between '.$a.' and '.$b,
                    'type' => 'text',
                    'metadata' => json_encode(['conversation_id' => $conversationId]),
                    'created_at' => now()->subMinutes(60-$i),
                    'updated_at' => now()->subMinutes(60-$i),
                ]);
            }
        }
    }
}


