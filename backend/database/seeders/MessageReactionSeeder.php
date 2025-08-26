<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageReactionSeeder extends Seeder
{
    public function run(): void
    {
        $messages = DB::table('messages')->select('id')->limit(100)->get();
        $users = DB::table('users')->select('id')->get();
        $emojis = ['👍','🎉','❤️','🚀','✅'];

        foreach ($messages as $m) {
            $reactionsForMessage = rand(0, 3);
            for ($i = 0; $i < $reactionsForMessage; $i++) {
                DB::table('message_reactions')->insert([
                    'message_id' => $m->id,
                    'user_id' => $users[rand(0, max(0, count($users)-1))]->id,
                    'emoji' => $emojis[array_rand($emojis)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}


