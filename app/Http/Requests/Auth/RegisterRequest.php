<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseFormRequest;

class RegisterRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
            'raison_sociale' => 'required|string|max:200',
            'nif'            => 'required|string|max:20|unique:clients,nif',
            'nis'            => 'required|string|max:20',
            'rc'             => 'required|string|max:50',
            'adresse_siege'  => 'required|string|max:255',
            'ville'          => 'required|string|max:100',
            'pays_id'        => 'required|exists:pays,id',
            'type_client'    => 'required|in:ENTREPRISE,PARTICULIER,ADMINISTRATION',
            'rep_nom'        => 'required|string|max:100',
            'rep_prenom'     => 'required|string|max:100',
            'rep_role'       => 'required|string|max:100',
            'rep_tel'        => 'required|string|max:20',
            'rep_email'      => 'required|email|max:150',
        ];
    }
}
