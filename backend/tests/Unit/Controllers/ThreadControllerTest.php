<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\ThreadController;
use App\Services\ThreadService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class ThreadControllerTest extends TestCase
{
    use RefreshDatabase;

    private ThreadService $threadService;
    private ThreadController $threadController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->threadService = Mockery::mock(ThreadService::class);
        $this->threadController = new ThreadController($this->threadService);
    }

    public function test_index_success()
    {
        $replies = [
            ['id' => 1, 'content' => 'Reply 1', 'parent_id' => 1],
            ['id' => 2, 'content' => 'Reply 2', 'parent_id' => 1],
        ];

        $this->threadService
            ->shouldReceive('getReplies')
            ->with(1)
            ->once()
            ->andReturn($replies);

        $response = $this->threadController->index(1);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertEquals($replies, $responseData['data']);
        $this->assertEquals('Thread replies retrieved successfully', $responseData['message']);
    }

    public function test_store_success()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $threadData = ['content' => 'New reply'];
        $createdReply = ['id' => 1, 'content' => 'New reply', 'parent_id' => 1, 'user_id' => $user->id];

        $this->threadService
            ->shouldReceive('addReply')
            ->with(1, $user->id, $threadData['content'], 'text', [])
            ->once()
            ->andReturn($createdReply);

        $request = $this->createMockThreadRequest($threadData);
        $response = $this->threadController->store(1, $request);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 201) {
            $this->fail('Expected 201 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_store_unauthenticated()
    {
        $threadData = ['content' => 'New reply'];

        $request = $this->createMockThreadRequest($threadData);
        $response = $this->threadController->store(1, $request);

        $this->assertEquals(401, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertFalse($responseData['success']);
        $this->assertEquals('Unauthenticated', $responseData['message']);
    }

    // ThreadController only has index and store methods
    // Update and destroy methods don't exist

    private function createMockThreadRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\ThreadRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }
}
