<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConversationRequest extends FormRequest
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
            'type' => 'required|string|in:direct,channel,team',
            'name' => 'nullable|string|max:255',
            'team_id' => 'nullable|integer|exists:teams,id',
            'channel_id' => 'nullable|integer|exists:channels,id',
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'integer|exists:users,id',
            'participant_id' => 'nullable|integer|exists:users,id',
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
            'type.required' => 'Loại conversation là bắt buộc.',
            'type.string' => 'Loại conversation phải là chuỗi ký tự.',
            'type.in' => 'Loại conversation phải là direct, channel hoặc team.',
            'name.string' => 'Tên conversation phải là chuỗi ký tự.',
            'name.max' => 'Tên conversation không được vượt quá 255 ký tự.',
            'team_id.integer' => 'Team ID phải là số nguyên.',
            'team_id.exists' => 'Team không tồn tại.',
            'channel_id.integer' => 'Channel ID phải là số nguyên.',
            'channel_id.exists' => 'Channel không tồn tại.',
            'user_ids.array' => 'Danh sách user phải là mảng.',
            'user_ids.*.integer' => 'User ID phải là số nguyên.',
            'user_ids.*.exists' => 'User không tồn tại.',
            'participant_id.integer' => 'Participant ID phải là số nguyên.',
            'participant_id.exists' => 'Participant không tồn tại.',
        ];
    }
}
