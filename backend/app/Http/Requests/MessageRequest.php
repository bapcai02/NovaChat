<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roomId' => 'required',
            'senderId' => 'required|integer',
            'content' => 'required|string',
            'type' => 'nullable|string|in:channel,direct',
        ];
    }
}


