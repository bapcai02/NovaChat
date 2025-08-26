<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ChannelMemberSeeder extends Seeder
{
    public function run(): void
    {
        $channels = DB::table('channels')->select('id')->get();
        $users = DB::table('users')->select('id')->get();

        foreach ($channels as $ch) {
            $count = 0;
            foreach ($users as $u) {
                if (($u->id + $ch->id) % 2 === 0 || $count < 5) { // ensure some members per channel
                    DB::table('channel_members')->updateOrInsert(
                        ['channel_id' => $ch->id, 'user_id' => $u->id],
                        ['role' => 'member', 'created_at' => now(), 'updated_at' => now()]
                    );
                    $count++;
                }
            }
        }
    }
}


