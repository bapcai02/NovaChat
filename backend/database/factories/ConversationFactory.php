<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\Team;
use App\Models\Channel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['direct', 'channel', 'team']),
            'team_id' => Team::factory(),
            'channel_id' => Channel::factory(),
            'name' => fake()->words(3, true),
            'metadata' => [
                'settings' => [
                    'allow_mentions' => true,
                    'allow_reactions' => true,
                ],
            ],
        ];
    }

    /**
     * Indicate that the conversation is pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }
}
