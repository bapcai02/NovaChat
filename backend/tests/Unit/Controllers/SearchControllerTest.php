<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\SearchController;
use App\Services\SearchService;
use Mockery;

class SearchControllerTest extends TestCase
{
    private SearchService $searchService;
    private SearchController $searchController;

    protected function setUp(): void
    {
        parent::setUp();

        $this->searchService = Mockery::mock(SearchService::class);
        $this->searchController = new SearchController($this->searchService);
    }

    public function test_search_success()
    {
        $searchData = ['q' => 'test', 'type' => 'messages'];
        $searchResults = [
            'messages' => [
                ['id' => 1, 'content' => 'test message', 'user_id' => 1],
            ],
            'users' => [
                ['id' => 1, 'name' => 'Test User', 'email' => 'test@example.com'],
            ],
        ];

        $this->searchService
            ->shouldReceive('search')
            ->with('test', ['type' => 'messages'])
            ->once()
            ->andReturn(['success' => true, 'data' => $searchResults]);

        $request = $this->createMockSearchRequest($searchData);
        $response = $this->searchController->search($request);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 200) {
            $this->fail('Expected 200 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_search_messages_success()
    {
        $searchData = ['q' => 'test', 'conversation_id' => 1];
        $searchResults = [
            ['id' => 1, 'content' => 'test message', 'conversation_id' => 1],
        ];

        $this->searchService
            ->shouldReceive('searchMessages')
            ->with('test', [])
            ->once()
            ->andReturn(['success' => true, 'data' => $searchResults]);

        $request = $this->createMockSearchMessagesRequest($searchData);
        $response = $this->searchController->searchMessages($request);

        // Debug: Check what status code we actually get
        $responseData = json_decode($response->getContent(), true);
        if ($response->getStatusCode() !== 200) {
            $this->fail('Expected 200 but got ' . $response->getStatusCode() . '. Response: ' . json_encode($responseData));
        }

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_search_basic_success()
    {
        $searchData = ['q' => 'test'];
        $searchResults = [
            'messages' => [
                ['id' => 1, 'content' => 'test message'],
            ],
            'users' => [
                ['id' => 1, 'name' => 'Test User'],
            ],
        ];

        $this->searchService
            ->shouldReceive('searchChannels')
            ->with('test')
            ->once()
            ->andReturn(['success' => true, 'data' => $searchResults]);

        $request = $this->createMockSearchBasicRequest($searchData);
        $response = $this->searchController->searchChannels($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    public function test_search_failure()
    {
        $searchData = ['q' => 'test'];

        $this->searchService
            ->shouldReceive('search')
            ->with('test', [])
            ->once()
            ->andReturn(['success' => false, 'message' => 'Search failed']);

        $request = $this->createMockSearchRequest($searchData);
        $response = $this->searchController->search($request);

        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getContent(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('data', $responseData);
    }

    private function createMockSearchRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\SearchRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }

    private function createMockSearchMessagesRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\SearchMessagesRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }

    private function createMockSearchBasicRequest(array $data)
    {
        $request = Mockery::mock('App\Http\Requests\SearchBasicRequest');
        $request->shouldReceive('validated')->andReturn($data);
        return $request;
    }
}
