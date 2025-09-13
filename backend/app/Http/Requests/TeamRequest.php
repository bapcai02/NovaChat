<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
            'members' => 'required|array|min:1',
            'members.*' => 'required|integer|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'members.required' => 'Vui lòng chọn ít nhất 1 thành viên',
            'members.min' => 'Vui lòng chọn ít nhất 1 thành viên',
            'members.*.required' => 'Thành viên không hợp lệ',
            'members.*.integer' => 'ID thành viên phải là số',
            'members.*.exists' => 'Thành viên không tồn tại',
        ];
    }
}


