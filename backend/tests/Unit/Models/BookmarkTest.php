<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Bookmark;
use App\Models\User;
use App\Models\Message;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BookmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_bookmark_belongs_to_user()
    {
        $user = User::factory()->create();
        $bookmark = Bookmark::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $bookmark->user);
        $this->assertEquals($user->id, $bookmark->user->id);
    }

    public function test_bookmark_belongs_to_message()
    {
        $message = Message::factory()->create();
        $bookmark = Bookmark::factory()->create(['message_id' => $message->id]);

        $this->assertInstanceOf(Message::class, $bookmark->message);
        $this->assertEquals($message->id, $bookmark->message->id);
    }

    public function test_bookmark_fillable_attributes()
    {
        $bookmark = new Bookmark();
        $fillable = $bookmark->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('message_id', $fillable);
        $this->assertContains('note', $fillable);
    }

    public function test_bookmark_casts()
    {
        $bookmark = Bookmark::factory()->create([
            'note' => 'Test note',
        ]);

        $this->assertIsString($bookmark->note);
    }
}
