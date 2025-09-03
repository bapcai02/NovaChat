<?php

namespace App\Interfaces\Request;

use Illuminate\Foundation\Http\FormRequest;

class MessageReactionRequest extends FormRequest
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
            'emoji' => 'required|string|max:10',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'emoji.required' => 'Emoji is required',
            'emoji.max' => 'Emoji must not exceed 10 characters',
        ];
    }
}
