<?php

namespace Tests\Unit\Services;

use App\Services\MessageService;
use App\Repositories\Contracts\MessageRepositoryInterface;
use App\Models\Message;
use App\Models\User;
use App\Models\Conversation;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class MessageServiceTest extends TestCase
{
    use RefreshDatabase;

    private $messageRepository;
    private $messageService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->messageRepository = Mockery::mock(MessageRepositoryInterface::class);
        $this->messageService = new MessageService($this->messageRepository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_get_messages_success()
    {
        $roomId = '1';
        $type = 'channel';
        $limit = 50;
        $beforeId = null;
        $userId = 1;

        $mockMessages = [
            ['id' => 1, 'content' => 'Message 1'],
            ['id' => 2, 'content' => 'Message 2'],
        ];

        $this->messageRepository
            ->shouldReceive('getForRoom')
            ->with($roomId, $type, $limit, $beforeId, $userId)
            ->andReturn($mockMessages);

        $result = $this->messageService->getMessages($roomId, $type, $limit, $beforeId, $userId);

        $this->assertTrue($result['success']);
        $this->assertEquals($mockMessages, $result['data']);
        $this->assertArrayHasKey('meta', $result);
        $this->assertFalse($result['meta']['hasMore']);
        $this->assertEquals(2, $result['meta']['count']);
        $this->assertEquals(2, $result['meta']['nextBeforeId']);
    }

    public function test_get_messages_with_has_more()
    {
        $roomId = '1';
        $type = 'channel';
        $limit = 2;
        $beforeId = null;
        $userId = 1;

        $mockMessages = [
            ['id' => 1, 'content' => 'Message 1'],
            ['id' => 2, 'content' => 'Message 2'],
        ];

        $this->messageRepository
            ->shouldReceive('getForRoom')
            ->with($roomId, $type, $limit, $beforeId, $userId)
            ->andReturn($mockMessages);

        $result = $this->messageService->getMessages($roomId, $type, $limit, $beforeId, $userId);

        $this->assertTrue($result['success']);
        $this->assertTrue($result['meta']['hasMore']);
        $this->assertEquals(2, $result['meta']['count']);
    }

    public function test_store_message_success()
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();

        $data = [
            'user_id' => $user->id,
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

        $this->messageRepository
            ->shouldReceive('create')
            ->with(Mockery::on(function ($messageData) use ($data) {
                return $messageData['user_id'] === $data['user_id'] &&
                       $messageData['content'] === $data['content'] &&
                       $messageData['type'] === $data['type'] &&
                       $messageData['conversation_id'] === $data['conversation_id'] &&
                       $messageData['metadata'] === $data['metadata'];
            }))
            ->andReturn($createdMessage);

        $result = $this->messageService->storeMessage($data);

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
    }

    public function test_store_message_with_parent_inherits_conversation()
    {
        $user = User::factory()->create();
        $conversation = Conversation::factory()->create();
        $parentMessage = Message::factory()->create(['conversation_id' => $conversation->id]);

        $data = [
            'user_id' => $user->id,
            'content' => 'Reply message',
            'type' => 'text',
            'parent_id' => $parentMessage->id,
            'conversation_id' => $conversation->id,
        ];

        $createdMessage = Message::factory()->create([
            'user_id' => $user->id,
            'content' => 'Reply message',
            'type' => 'text',
            'parent_id' => $parentMessage->id,
            'conversation_id' => $conversation->id,
        ]);

        $this->messageRepository
            ->shouldReceive('findById')
            ->with($parentMessage->id)
            ->andReturn($parentMessage);

        $this->messageRepository
            ->shouldReceive('create')
            ->with(Mockery::on(function ($messageData) use ($data) {
                return $messageData['user_id'] === $data['user_id'] &&
                       $messageData['content'] === $data['content'] &&
                       $messageData['parent_id'] === $data['parent_id'] &&
                       $messageData['conversation_id'] === $data['conversation_id'];
            }))
            ->andReturn($createdMessage);

        $result = $this->messageService->storeMessage($data);

        $this->assertTrue($result['success']);
    }

    public function test_store_message_handles_errors()
    {
        $data = [
            'user_id' => 999,
            'content' => 'Test message',
            'type' => 'text',
        ];

        $this->messageRepository
            ->shouldReceive('create')
            ->andThrow(new \Exception('Database error'));

        $this->expectException(\Exception::class);
        $this->messageService->storeMessage($data);
    }

    public function test_edit_message_success()
    {
        $user = User::factory()->create();
        $message = Message::factory()->create(['user_id' => $user->id]);

        $data = [
            'content' => 'Updated message',
            'metadata' => ['edited' => true],
        ];

        $updatedMessage = $message->fresh();
        $updatedMessage->content = 'Updated message';
        $updatedMessage->metadata = ['edited' => true];
        $updatedMessage->is_edited = true;

        $this->messageRepository
            ->shouldReceive('findById')
            ->with($message->id)
            ->andReturn($message->toArray());

        $this->messageRepository
            ->shouldReceive('edit')
            ->with($message->id, $data['content'])
            ->andReturn($updatedMessage->toArray());

        $result = $this->messageService->editMessage($message->id, $user->id, $data['content']);

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
    }

    public function test_edit_message_not_found()
    {
        $messageId = 999;
        $data = ['content' => 'Updated message'];

        $this->messageRepository
            ->shouldReceive('findById')
            ->with($messageId)
            ->andReturn(null);

        $result = $this->messageService->editMessage($messageId, 1, $data['content']);

        $this->assertFalse($result['success']);
        $this->assertArrayHasKey('message', $result);
    }
}
