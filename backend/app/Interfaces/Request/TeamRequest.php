<?php

namespace App\Interfaces\Request;

use Illuminate\Foundation\Http\FormRequest;

class TeamRequest extends FormRequest
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
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'members' => 'sometimes|array',
            'members.*' => 'integer|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Team name is required',
            'name.max' => 'Team name must not exceed 100 characters',
            'description.max' => 'Description must not exceed 500 characters',
            'members.array' => 'Members must be an array',
            'members.*.integer' => 'Each member must be a valid user ID',
            'members.*.exists' => 'One or more members do not exist',
        ];
    }
}
