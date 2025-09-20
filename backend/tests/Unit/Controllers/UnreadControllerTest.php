<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\UnreadController;
use App\Models\User;
use App\Models\Conversation;
use App\Models\MessageRead;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class UnreadControllerTest extends TestCase
{
    use RefreshDatabase;

    private UnreadController $unreadController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->unreadController = new UnreadController();
    }

    public function test_get_unread_counts_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversation = Conversation::factory()->create();
        $unreadCounts = [$conversation->id => 5];

        // Mock the static method call
        $this->mock('App\Models\MessageRead', function ($mock) use ($unreadCounts, $user) {
            $mock->shouldReceive('getUnreadCountsForUser')
                ->with($user->id)
                ->andReturn($unreadCounts);
        });

        $response = $this->unreadController->getUnreadCounts();

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_get_unread_counts_unauthenticated()
    {
        $response = $this->unreadController->getUnreadCounts();

        $this->assertEquals(401, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Unauthenticated', $responseData['message']);
    }

    public function test_mark_conversation_as_read_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversation = Conversation::factory()->create();
        
        // Add user to conversation
        $conversation->members()->attach($user->id);

        $response = $this->unreadController->markConversationAsRead($conversation->id);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 200) {
            $this->fail('Expected 200 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Conversation marked as read', $responseData['message']);
    }

    public function test_mark_conversation_as_read_unauthenticated()
    {
        $conversation = Conversation::factory()->create();

        $response = $this->unreadController->markConversationAsRead($conversation->id);

        $this->assertEquals(403, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('You are not a member of this conversation', $responseData['message']);
    }

    public function test_get_conversation_unread_count_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversation = Conversation::factory()->create();
        
        // Add user to conversation
        $conversation->members()->attach($user->id);

        $response = $this->unreadController->getConversationUnreadCount($conversation->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('unread_count', $responseData['data']);
    }
}
