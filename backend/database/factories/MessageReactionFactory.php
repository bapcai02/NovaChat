<?php

namespace Database\Factories;

use App\Models\MessageReaction;
use App\Models\User;
use App\Models\Message;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MessageReaction>
 */
class MessageReactionFactory extends Factory
{
    protected $model = MessageReaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $reactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡'];
        
        return [
            'user_id' => User::factory(),
            'message_id' => Message::factory(),
            'emoji' => fake()->randomElement($reactions),
        ];
    }
}
