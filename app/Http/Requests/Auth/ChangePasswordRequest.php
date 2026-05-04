<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

class ChangePasswordRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
