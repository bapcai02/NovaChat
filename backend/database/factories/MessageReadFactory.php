<?php

namespace Database\Factories;

use App\Models\MessageRead;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MessageRead>
 */
class MessageReadFactory extends Factory
{
    protected $model = MessageRead::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'message_id' => Message::factory(),
            'user_id' => User::factory(),
            'read_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ];
    }
}
