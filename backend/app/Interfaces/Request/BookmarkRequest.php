<?php

namespace App\Interfaces\Request;

use Illuminate\Foundation\Http\FormRequest;

class BookmarkRequest extends FormRequest
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
            case 'store':
                return [
                    'note' => 'nullable|string|max:500',
                    'tags' => 'nullable|array',
                    'tags.*' => 'string|max:50',
                ];
                
            case 'update':
                return [
                    'note' => 'nullable|string|max:500',
                    'tags' => 'nullable|array',
                    'tags.*' => 'string|max:50',
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
            'note.max' => 'Note must not exceed 500 characters',
            'tags.array' => 'Tags must be an array',
            'tags.*.string' => 'Each tag must be a string',
            'tags.*.max' => 'Each tag must not exceed 50 characters',
        ];
    }
}
