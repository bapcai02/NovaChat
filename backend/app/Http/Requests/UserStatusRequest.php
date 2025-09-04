<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'roomId' => 'required|string',
            'status' => 'required|string|in:online,offline,away,busy',
            'statusMessage' => 'nullable|string|max:255',
        ];
    }
}


