<?php

namespace App\Interfaces\Request;

use Illuminate\Foundation\Http\FormRequest;

class UserStatusRequest extends FormRequest
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
        $action = $this->route()->getActionMethod();
        
        switch ($action) {
            case 'updateStatus':
                return [
                    'status' => 'required|string|in:online,away,busy,offline',
                    'statusMessage' => 'nullable|string|max:100',
                    'roomId' => 'required|string',
                ];
                
            case 'startTyping':
            case 'stopTyping':
                return [
                    'roomId' => 'required|string',
                ];
                
            default:
                return [];
        }
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status is required',
            'status.in' => 'Status must be one of: online, away, busy, offline',
            'statusMessage.max' => 'Status message must not exceed 100 characters',
            'roomId.required' => 'Room ID is required',
        ];
    }
}
