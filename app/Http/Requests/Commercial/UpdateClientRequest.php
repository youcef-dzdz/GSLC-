<?php

namespace App\Http\Requests\Commercial;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $clientId = $this->route('client') instanceof \App\Models\Client
            ? $this->route('client')->id
            : $this->route('client');

        return [
            'raison_sociale'   => 'sometimes|string|max:200',
            'nif'              => ['sometimes', 'string', 'max:20', Rule::unique('clients', 'nif')->ignore($clientId)],
            'nis'              => ['sometimes', 'string', 'max:20', Rule::unique('clients', 'nis')->ignore($clientId)],
            'rc'               => ['sometimes', 'string', 'max:50', Rule::unique('clients', 'rc')->ignore($clientId)],
            'adresse_siege'    => 'sometimes|string|max:255',
            'ville'            => 'sometimes|string|max:100',
            'pays_id'          => 'sometimes|integer|exists:pays,id',
            'type_client'      => 'sometimes|in:ENTREPRISE,PARTICULIER,ADMINISTRATION',
            'rep_nom'          => 'sometimes|string|max:100',
            'rep_prenom'       => 'sometimes|string|max:100',
            'rep_role'         => 'sometimes|string|max:100',
            'rep_tel'          => 'sometimes|string|max:20',
            'rep_email'        => 'sometimes|email|max:150',
            'rep_adresse_perso'=> 'nullable|string|max:255',
            'statut'           => 'sometimes|in:EN_ATTENTE_VALIDATION,APPROUVE,REJETE,SUSPENDU',
            'motif_rejet'      => 'nullable|string|max:500|required_if:statut,REJETE',
        ];
    }

    public function messages(): array
    {
        return [
            'nif.unique'                     => 'Ce NIF est déjà utilisé par un autre client.',
            'nis.unique'                     => 'Ce NIS est déjà utilisé par un autre client.',
            'rc.unique'                      => 'Ce RC est déjà utilisé par un autre client.',
            'pays_id.exists'                 => 'Pays sélectionné invalide.',
            'type_client.in'                 => 'Type de client invalide.',
            'rep_email.email'                => 'Courriel invalide.',
            'statut.in'                      => 'Statut invalide.',
            'motif_rejet.required_if'        => 'Le motif de rejet est obligatoire lorsque le statut est REJETÉ.',
        ];
    }
}
