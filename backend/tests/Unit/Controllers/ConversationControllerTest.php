<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\ConversationController;
use App\Services\ConversationService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class ConversationControllerTest extends TestCase
{
    use RefreshDatabase;

    private ConversationService $conversationService;
    private ConversationController $conversationController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->conversationService = Mockery::mock(ConversationService::class);
        $this->conversationController = new ConversationController($this->conversationService);
    }

    public function test_index_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversations = [
            ['id' => 1, 'name' => 'General', 'type' => 'channel'],
            ['id' => 2, 'name' => 'Direct Message', 'type' => 'direct'],
        ];

        $this->conversationService
            ->shouldReceive('getUserConversations')
            ->with($user->id)
            ->once()
            ->andReturn(['success' => true, 'data' => $conversations]);

        $request = $this->createMockRequest();
        $response = $this->conversationController->index($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_index_unauthenticated()
    {
        $request = $this->createMockRequest();
        $response = $this->conversationController->index($request);

        $this->assertEquals(401, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Unauthenticated', $responseData['message']);
    }

    public function test_store_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversationData = ['name' => 'New Conversation', 'type' => 'channel'];
        $createdConversation = ['id' => 1, 'name' => 'New Conversation', 'type' => 'channel'];

        $this->conversationService
            ->shouldReceive('createConversation')
            ->with(Mockery::on(function ($data) use ($conversationData) {
                return $data['name'] === $conversationData['name'] 
                    && $data['type'] === $conversationData['type']
                    && isset($data['creator_id']);
            }))
            ->once()
            ->andReturn(['success' => true, 'data' => $createdConversation]);

        $request = $this->createMockConversationRequest($conversationData);
        $response = $this->conversationController->store($request);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 201) {
            $this->fail('Expected 201 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_show_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $conversation = ['id' => 1, 'name' => 'General', 'type' => 'channel'];

        $this->conversationService
            ->shouldReceive('getConversation')
            ->with('1', $user->id)
            ->once()
            ->andReturn(['success' => true, 'data' => $conversation]);

        $request = $this->createMockRequest();
        $response = $this->conversationController->show($request, '1');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($conversation, $responseData['data']);
    }

    public function test_show_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->conversationService
            ->shouldReceive('getConversation')
            ->with('999', $user->id)
            ->once()
            ->andReturn(['success' => false, 'message' => 'Conversation not found']);

        $request = $this->createMockRequest();
        $response = $this->conversationController->show($request, '999');

        $this->assertEquals(404, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Conversation not found', $responseData['message']);
    }

    public function test_get_messages_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $messages = [
            ['id' => 1, 'content' => 'Hello', 'user_id' => 1],
            ['id' => 2, 'content' => 'Hi there', 'user_id' => 2],
        ];

        $this->conversationService
            ->shouldReceive('getConversationMessages')
            ->with('1', $user->id, 50, null)
            ->once()
            ->andReturn(['success' => true, 'data' => $messages]);

        $request = $this->createMockRequest();
        $response = $this->conversationController->getMessages($request, '1');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($messages, $responseData['data']);
    }

    public function test_add_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->conversationService
            ->shouldReceive('addMember')
            ->with('1', 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member added successfully']);

        $request = $this->createMockAddMemberRequest(['user_id' => 2]);
        $response = $this->conversationController->addMember($request, '1');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member added successfully', $responseData['message']);
    }

    public function test_remove_member_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->conversationService
            ->shouldReceive('removeMember')
            ->with('1', 2, $user->id)
            ->once()
            ->andReturn(['success' => true, 'message' => 'Member removed successfully']);

        $request = $this->createMockRemoveMemberRequest(['user_id' => 2]);
        $response = $this->conversationController->removeMember($request, '1', '2');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals('Member removed successfully', $responseData['message']);
    }

    private function createMockRequest(array $query = [])
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('query')->andReturnUsing(function ($key, $default = null) use ($query) {
            return $query[$key] ?? $default;
        });
        return $request;
    }

    private function createMockConversationRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\ConversationRequest');
        $request->shouldReceive('validated')->andReturn($data);
        $request->shouldReceive('all')->andReturn($data);
        return $request;
    }

    private function createMockAddMemberRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\AddMemberRequest');
        $request->shouldReceive('validated')->andReturn($data);
        $request->user_id = $data['user_id'];
        return $request;
    }

    private function createMockRemoveMemberRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\AddMemberRequest');
        $request->shouldReceive('validated')->andReturn($data);
        $request->user_id = $data['user_id'];
        return $request;
    }
}
