<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\ConversationService;
use App\Repositories\Contracts\ConversationRepositoryInterface;
use Mockery;

class ConversationServiceTest extends TestCase
{
    private ConversationRepositoryInterface $conversationRepository;
    private ConversationService $conversationService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->conversationRepository = Mockery::mock(ConversationRepositoryInterface::class);
        $this->conversationService = new ConversationService($this->conversationRepository);
    }

    public function test_get_user_conversations_success()
    {
        $conversations = [
            ['id' => 1, 'name' => 'General', 'type' => 'channel'],
            ['id' => 2, 'name' => 'Direct Message', 'type' => 'direct'],
        ];

        $this->conversationRepository
            ->shouldReceive('getUserConversations')
            ->with(1)
            ->once()
            ->andReturn($conversations);

        $result = $this->conversationService->getUserConversations(1);

        $this->assertTrue($result['success']);
        $this->assertEquals($conversations, $result['data']);
    }

    public function test_get_user_conversations_handles_exception()
    {
        $this->conversationRepository
            ->shouldReceive('getUserConversations')
            ->with(1)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->conversationService->getUserConversations(1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Failed to load conversations', $result['message']);
    }

    public function test_create_conversation_success()
    {
        $data = ['name' => 'New Conversation', 'type' => 'channel'];
        $createdConversation = ['id' => 1, 'name' => 'New Conversation', 'type' => 'channel'];

        $this->conversationRepository
            ->shouldReceive('create')
            ->with($data)
            ->once()
            ->andReturn($createdConversation);

        $result = $this->conversationService->createConversation($data);

        $this->assertTrue($result['success']);
        $this->assertEquals($createdConversation, $result['data']);
    }

    public function test_create_conversation_handles_exception()
    {
        $data = ['name' => 'New Conversation', 'type' => 'channel'];

        $this->conversationRepository
            ->shouldReceive('create')
            ->with($data)
            ->once()
            ->andThrow(new \Exception('Database error'));

        $result = $this->conversationService->createConversation($data);

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Failed to create conversation', $result['message']);
    }

    public function test_get_conversation_success()
    {
        $conversation = ['id' => 1, 'name' => 'General', 'type' => 'channel'];

        $this->conversationRepository
            ->shouldReceive('findById')
            ->with(1)
            ->once()
            ->andReturn($conversation);

        $this->conversationRepository
            ->shouldReceive('isMember')
            ->with('1', 1)
            ->once()
            ->andReturn(true);

        $result = $this->conversationService->getConversation('1', 1);

        $this->assertTrue($result['success']);
        $this->assertEquals($conversation, $result['data']);
    }

    public function test_get_conversation_not_found()
    {
        $this->conversationRepository
            ->shouldReceive('findById')
            ->with(999)
            ->once()
            ->andReturn(null);

        $result = $this->conversationService->getConversation('999', 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Conversation not found', $result['message']);
    }

    public function test_get_conversation_access_denied()
    {
        $conversation = ['id' => 1, 'name' => 'General', 'type' => 'channel'];

        $this->conversationRepository
            ->shouldReceive('findById')
            ->with(1)
            ->once()
            ->andReturn($conversation);

        $this->conversationRepository
            ->shouldReceive('isMember')
            ->with('1', 1)
            ->once()
            ->andReturn(false);

        $result = $this->conversationService->getConversation('1', 1);

        $this->assertFalse($result['success']);
        $this->assertEquals('Access denied', $result['message']);
    }

}
