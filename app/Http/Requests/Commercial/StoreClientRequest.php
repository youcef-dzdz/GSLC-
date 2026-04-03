<?php

namespace App\Http\Requests\Commercial;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'raison_sociale'   => 'required|string|max:200',
            'nif'              => 'required|string|max:20|unique:clients,nif',
            'nis'              => 'required|string|max:20|unique:clients,nis',
            'rc'               => 'required|string|max:50|unique:clients,rc',
            'adresse_siege'    => 'required|string|max:255',
            'ville'            => 'required|string|max:100',
            'pays_id'          => 'required|integer|exists:pays,id',
            'type_client'      => 'required|in:ENTREPRISE,PARTICULIER,ADMINISTRATION',
            'rep_nom'          => 'required|string|max:100',
            'rep_prenom'       => 'required|string|max:100',
            'rep_role'         => 'required|string|max:100',
            'rep_tel'          => 'required|string|max:20',
            'rep_email'        => 'required|email|max:150|unique:users,email',
            'rep_adresse_perso'=> 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'raison_sociale.required'  => 'La raison sociale est obligatoire.',
            'nif.required'             => 'Le NIF est obligatoire.',
            'nif.unique'               => 'Ce NIF est déjà utilisé par un autre client.',
            'nis.required'             => 'Le NIS est obligatoire.',
            'nis.unique'               => 'Ce NIS est déjà utilisé par un autre client.',
            'rc.required'              => 'Le registre de commerce est obligatoire.',
            'rc.unique'                => 'Ce RC est déjà utilisé par un autre client.',
            'pays_id.required'         => 'Le pays est obligatoire.',
            'pays_id.exists'           => 'Pays sélectionné invalide.',
            'type_client.required'     => 'Le type de client est obligatoire.',
            'type_client.in'           => 'Type de client invalide.',
            'rep_nom.required'         => 'Le nom du représentant est obligatoire.',
            'rep_prenom.required'      => 'Le prénom du représentant est obligatoire.',
            'rep_role.required'        => 'La fonction du représentant est obligatoire.',
            'rep_tel.required'         => 'Le téléphone du représentant est obligatoire.',
            'rep_email.required'       => 'Le courriel du représentant est obligatoire.',
            'rep_email.email'          => 'Courriel invalide.',
            'rep_email.unique'         => 'Un compte existe déjà avec ce courriel.',
        ];
    }
}
