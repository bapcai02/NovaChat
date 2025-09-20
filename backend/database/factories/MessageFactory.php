<?php

namespace Database\Factories;

use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Channel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Message>
 */
class MessageFactory extends Factory
{
    protected $model = Message::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'conversation_id' => Conversation::factory(),
            'channel_id' => null,
            'parent_id' => null,
            'content' => fake()->sentence(),
            'type' => 'text',
            'metadata' => null,
            'is_edited' => false,
            'edited_at' => null,
            'is_pinned' => false,
            'is_deleted' => false,
            'deleted_at' => null,
        ];
    }

    /**
     * Indicate that the message is edited.
     */
    public function edited(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_edited' => true,
            'edited_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the message is pinned.
     */
    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
        ]);
    }

    /**
     * Indicate that the message is deleted.
     */
    public function deleted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_deleted' => true,
            'deleted_at' => fake()->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the message is a reply.
     */
    public function reply(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => Message::factory(),
        ]);
    }

    /**
     * Indicate that the message has metadata.
     */
    public function withMetadata(): static
    {
        return $this->state(fn (array $attributes) => [
            'metadata' => [
                'attachments' => [],
                'mentions' => [],
                'reactions' => [],
            ],
        ]);
    }
}
