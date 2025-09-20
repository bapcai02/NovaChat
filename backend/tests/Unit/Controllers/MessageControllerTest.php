<?php

namespace Tests\Unit\Controllers;

use App\Http\Controllers\MessageController;
use App\Services\MessageService;
use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class MessageControllerTest extends TestCase
{
    use RefreshDatabase;

    private $messageService;
    private $messageController;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->messageService = Mockery::mock(MessageService::class);
        $this->messageController = new MessageController($this->messageService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_messages_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $mockMessages = [
            ['id' => 1, 'content' => 'Message 1'],
            ['id' => 2, 'content' => 'Message 2'],
        ];

        $this->messageService
            ->shouldReceive('getMessages')
            ->with('1', 'channel', 50, null, $user->id)
            ->andReturn([
                'success' => true,
                'data' => $mockMessages,
                'meta' => [
                    'hasMore' => false,
                    'nextBeforeId' => 2,
                    'count' => 2,
                ]
            ]);

        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('query')->with('type', 'channel')->andReturn('channel');
        $request->shouldReceive('query')->with('limit', 50)->andReturn(50);
        $request->shouldReceive('query')->with('beforeId')->andReturn(null);
        
        $response = $this->messageController->index($request, '1');

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
        $this->assertEquals($mockMessages, $responseData['data']);
    }

    public function test_store_message_success()
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $this->actingAs($user);

        $messageData = [
            'content' => 'Test message',
            'type' => 'text',
            'conversation_id' => $conversation->id,
            'metadata' => ['key' => 'value'],
        ];

        $createdMessage = Message::factory()->create([
            'user_id' => $user->id,
            'content' => 'Test message',
            'type' => 'text',
            'conversation_id' => $conversation->id,
            'metadata' => ['key' => 'value'],
        ]);

        $this->messageService
            ->shouldReceive('storeMessage')
            ->with(Mockery::on(function ($data) use ($messageData, $user) {
                return $data['user_id'] === $user->id &&
                       $data['content'] === $messageData['content'] &&
                       $data['type'] === $messageData['type'] &&
                       $data['conversation_id'] === $messageData['conversation_id'];
            }))
            ->andReturn([
                'success' => true,
                'status' => 201,
                'data' => $createdMessage->toArray(),
                'message' => 'Message created successfully',
            ]);

        $request = $this->createMockMessageRequest($messageData);
        $response = $this->messageController->store($request, $conversation->id);

        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_edit_message_success()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user);

        $updateData = [
            'content' => 'Updated message',
            'metadata' => ['edited' => true],
        ];

        $updatedMessage = $message->fresh();
        $updatedMessage->content = 'Updated message';
        $updatedMessage->metadata = ['edited' => true];
        $updatedMessage->is_edited = true;

        $this->messageService
            ->shouldReceive('editMessage')
            ->with($message->id, $user->id, $updateData['content'])
            ->andReturn([
                'success' => true,
                'status' => 200,
                'data' => $updatedMessage->toArray(),
                'message' => 'Message updated successfully',
            ]);

        $request = $this->createMockEditMessageRequest($updateData);
        $response = $this->messageController->edit($request, $message->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_edit_message_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $updateData = [
            'content' => 'Updated message',
        ];

        $this->messageService
            ->shouldReceive('editMessage')
            ->with('999', $user->id, $updateData['content'])
            ->andReturn([
                'success' => false,
                'status' => 404,
                'message' => 'Message not found',
            ]);

        $request = $this->createMockEditMessageRequest($updateData);
        $response = $this->messageController->edit($request, '999');

        $this->assertEquals(404, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_delete_message_success()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['user_id' => $user->id]);
        $this->actingAs($user);

        $this->messageService
            ->shouldReceive('deleteMessage')
            ->with($message->id, $user->id)
            ->andReturn([
                'success' => true,
                'status' => 200,
                'message' => 'Message deleted successfully',
            ]);

        $response = $this->messageController->destroy($message->id);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('message', $responseData);
    }

    public function test_delete_message_not_found()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->messageService
            ->shouldReceive('deleteMessage')
            ->with('999', $user->id)
            ->andReturn([
                'success' => false,
                'status' => 404,
                'message' => 'Message not found',
            ]);

        $response = $this->messageController->destroy('999');

        $this->assertEquals(404, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertArrayHasKey('message', $responseData);
    }

    private function createMockRequest(array $data)
    {
        $request = Mockery::mock('Illuminate\Http\Request');
        $request->shouldReceive('all')->andReturn($data);
        $request->shouldReceive('only')->andReturn($data);
        return $request;
    }

    private function createMockMessageRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\MessageRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }

    private function createMockEditMessageRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\EditMessageRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }
}
