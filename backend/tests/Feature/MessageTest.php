<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\Team;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_messages()
    {
        $user = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);
        $message = Message::factory()->create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
        ]);

        $token = $user->createToken('test-token')->accessToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/messages?room_id={$conversation->id}&type=conversation");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        '*' => [
                            'id',
                            'content',
                            'user_id',
                            'conversation_id',
                        ]
                    ],
                    'meta' => [
                        'hasMore',
                        'nextBeforeId',
                        'count',
                    ],
                ]);
    }

    public function test_authenticated_user_can_create_message()
    {
        $user = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);

        $token = $user->createToken('test-token')->accessToken;

        $messageData = [
            'content' => 'Hello World',
            'type' => 'text',
            'conversation_id' => $conversation->id,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/messages', $messageData);

        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'content',
                        'user_id',
                        'conversation_id',
                    ],
                    'message',
                ]);

        $this->assertDatabaseHas('messages', [
            'content' => 'Hello World',
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
        ]);
    }

    public function test_authenticated_user_can_edit_own_message()
    {
        $user = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);
        $message = Message::factory()->create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
            'content' => 'Original message',
        ]);

        $token = $user->createToken('test-token')->accessToken;

        $updateData = [
            'content' => 'Updated message',
            'metadata' => ['edited' => true],
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/messages/{$message->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data' => [
                        'id',
                        'content',
                        'is_edited',
                    ],
                    'message',
                ]);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'content' => 'Updated message',
            'is_edited' => true,
        ]);
    }

    public function test_authenticated_user_cannot_edit_other_user_message()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);
        $message = Message::factory()->create([
            'user_id' => $otherUser->id,
            'conversation_id' => $conversation->id,
            'content' => 'Original message',
        ]);

        $token = $user->createToken('test-token')->accessToken;

        $updateData = [
            'content' => 'Updated message',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/messages/{$message->id}", $updateData);

        $response->assertStatus(403)
                ->assertJsonStructure([
                    'success',
                    'message',
                ]);
    }

    public function test_authenticated_user_can_delete_own_message()
    {
        $user = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);
        $message = Message::factory()->create([
            'user_id' => $user->id,
            'conversation_id' => $conversation->id,
        ]);

        $token = $user->createToken('test-token')->accessToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'message',
                ]);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_deleted' => true,
        ]);
    }

    public function test_authenticated_user_cannot_delete_other_user_message()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $team = Team::factory()->create();
        $conversation = Conversation::factory()->create(['team_id' => $team->id]);
        $message = Message::factory()->create([
            'user_id' => $otherUser->id,
            'conversation_id' => $conversation->id,
        ]);

        $token = $user->createToken('test-token')->accessToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/messages/{$message->id}");

        $response->assertStatus(403)
                ->assertJsonStructure([
                    'success',
                    'message',
                ]);
    }

    public function test_unauthenticated_user_cannot_access_messages()
    {
        $response = $this->getJson('/api/messages');

        $response->assertStatus(401);
    }

    public function test_message_validation_requires_content()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->accessToken;

        $messageData = [
            'type' => 'text',
            'conversation_id' => 1,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/messages', $messageData);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'errors',
                ]);
    }
}
