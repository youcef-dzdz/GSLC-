<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

abstract class BaseFormRequest extends FormRequest
{
    /**
     * Always respond with JSON — never redirect.
     */
    public function wantsJson(): bool
    {
        return true;
    }

    /**
     * Return a consistent JSON error shape on validation failure.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Les données fournies sont invalides.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
