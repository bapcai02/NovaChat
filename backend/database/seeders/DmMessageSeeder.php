<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DmMessageSeeder extends Seeder
{
    public function run(): void
    {
        $pairs = [ [1,2], [1,3], [2,3], [1,4] ];
        foreach ($pairs as [$a,$b]) {
            for ($i = 0; $i < 20; $i++) {
                $sender = $i % 2 === 0 ? $a : $b;
                $receiver = $sender === $a ? $b : $a;
                DB::table('messages')->insert([
                    'channel_id' => 0, // DM
                    'user_id' => $sender,
                    'parent_id' => null,
                    'content' => 'DM #'.($i+1).' between '.$a.' and '.$b,
                    'type' => 'text',
                    'metadata' => json_encode([
                        'receiver_id' => $receiver,
                    ]),
                    'is_edited' => false,
                    'is_pinned' => false,
                    'created_at' => now()->subMinutes(200 - ($i + $a + $b)),
                    'updated_at' => now()->subMinutes(200 - ($i + $a + $b)),
                ]);
            }
        }
    }
}


