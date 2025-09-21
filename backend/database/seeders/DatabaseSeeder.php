<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ChatDataSeeder::class,
            // Uncomment the line below to run large data seeding (10k users, 1M messages)
            // LargeDataSeeder::class,
        ]);
    }
}
