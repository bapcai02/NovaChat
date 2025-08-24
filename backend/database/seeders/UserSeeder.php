<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domain\User\Entities\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@novachat.com',
            'username' => 'admin',
            'password' => Hash::make('password123'),
            'status' => 'active',
            'avatar' => 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff',
            'bio' => 'System Administrator',
            'last_seen_at' => now(),
        ]);

        // Create sample users
        $users = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'username' => 'johndoe',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff',
                'bio' => 'Software Developer',
                'last_seen_at' => now(),
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'username' => 'janesmith',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Jane+Smith&background=f59e0b&color=fff',
                'bio' => 'Product Manager',
                'last_seen_at' => now()->subMinutes(30),
            ],
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'username' => 'mikejohnson',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Mike+Johnson&background=ef4444&color=fff',
                'bio' => 'UX Designer',
                'last_seen_at' => now()->subMinutes(15),
            ],
            [
                'name' => 'Sarah Wilson',
                'email' => 'sarah@example.com',
                'username' => 'sarahwilson',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Sarah+Wilson&background=8b5cf6&color=fff',
                'bio' => 'Frontend Developer',
                'last_seen_at' => now(),
            ],
            [
                'name' => 'David Brown',
                'email' => 'david@example.com',
                'username' => 'davidbrown',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=David+Brown&background=6b7280&color=fff',
                'bio' => 'Backend Developer',
                'last_seen_at' => now()->subHours(2),
            ],
            [
                'name' => 'Emily Davis',
                'email' => 'emily@example.com',
                'username' => 'emilydavis',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Emily+Davis&background=ec4899&color=fff',
                'bio' => 'QA Engineer',
                'last_seen_at' => now(),
            ],
            [
                'name' => 'Alex Chen',
                'email' => 'alex@example.com',
                'username' => 'alexchen',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Alex+Chen&background=14b8a6&color=fff',
                'bio' => 'DevOps Engineer',
                'last_seen_at' => now()->subMinutes(45),
            ],
            [
                'name' => 'Lisa Garcia',
                'email' => 'lisa@example.com',
                'username' => 'lisagarcia',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Lisa+Garcia&background=f97316&color=fff',
                'bio' => 'UI Designer',
                'last_seen_at' => now(),
            ],
            [
                'name' => 'Tom Wilson',
                'email' => 'tom@example.com',
                'username' => 'tomwilson',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Tom+Wilson&background=84cc16&color=fff',
                'bio' => 'Full Stack Developer',
                'last_seen_at' => now()->subMinutes(10),
            ],
            [
                'name' => 'Maria Rodriguez',
                'email' => 'maria@example.com',
                'username' => 'mariarodriguez',
                'password' => Hash::make('password123'),
                'status' => 'active',
                'avatar' => 'https://ui-avatars.com/api/?name=Maria+Rodriguez&background=06b6d4&color=fff',
                'bio' => 'Data Scientist',
                'last_seen_at' => now()->subHours(1),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('Users seeded successfully!');
        $this->command->info('Admin credentials: admin@novachat.com / password123');
        $this->command->info('Sample user credentials: john@example.com / password123');
    }
}
