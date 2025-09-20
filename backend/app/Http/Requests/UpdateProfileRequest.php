<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            // Accept either existing URL string or uploaded file (handled in controller)
            'avatar' => 'nullable',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Convert empty strings to null for proper validation
        $data = $this->all();
        foreach ($data as $key => $value) {
            if ($value === '') {
                $data[$key] = null;
            }
        }
        $this->merge($data);
    }
}
