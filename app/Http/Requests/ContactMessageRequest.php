<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactMessageRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nom_complet' => 'required|string|max:100',
            'entreprise'  => 'nullable|string|max:100',
            'email'       => 'required|email|max:150',
            'objet'       => 'required|in:demande_location,demande_devis,suivi_expedition,information_services,reclamation,autre',
            'message'     => 'required|string|min:10|max:2000',
        ];
    }
}
