<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchBasicRequest extends FormRequest
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
            'q' => 'required|string|min:1|max:255',
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
            'q.required' => 'Từ khóa tìm kiếm là bắt buộc.',
            'q.string' => 'Từ khóa tìm kiếm phải là chuỗi ký tự.',
            'q.min' => 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự.',
            'q.max' => 'Từ khóa tìm kiếm không được vượt quá 255 ký tự.',
        ];
    }
}
