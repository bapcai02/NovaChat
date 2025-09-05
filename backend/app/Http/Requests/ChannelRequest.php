<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChannelRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:channels,name',
            'display_name' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_private' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên channel là bắt buộc.',
            'name.string' => 'Tên channel phải là chuỗi ký tự.',
            'name.max' => 'Tên channel không được vượt quá 255 ký tự.',
            'name.unique' => 'Tên channel đã được sử dụng.',
            'display_name.string' => 'Tên hiển thị phải là chuỗi ký tự.',
            'display_name.max' => 'Tên hiển thị không được vượt quá 255 ký tự.',
            'description.string' => 'Mô tả phải là chuỗi ký tự.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
            'is_private.boolean' => 'Trạng thái private phải là true hoặc false.',
        ];
    }
}
