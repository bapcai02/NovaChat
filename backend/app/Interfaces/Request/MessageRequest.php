<?php

namespace App\Interfaces\Request;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'type' => 'nullable|string|in:channel,direct',
            'roomId' => 'required|string',
            'senderId' => 'required|string',
            'content' => 'required|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'type.in' => 'Type must be either channel or direct',
            'roomId.required' => 'Room ID is required',
            'senderId.required' => 'Sender ID is required',
            'content.required' => 'Message content is required',
        ];
    }
}
