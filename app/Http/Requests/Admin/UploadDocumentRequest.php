<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\BaseFormRequest;

class UploadDocumentRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file'          => [
                'required',
                'file',
                'max:10240',
                'mimes:pdf,jpg,jpeg,png',
            ],
            'type_document' => 'required|in:RC,NIF,NIS,FACTURE_PROFORMA,BILL_OF_LADING,CERTIFICAT_ORIGINE,LISTE_COLISAGE',
            'client_id'     => 'required|exists:clients,id',
            'demande_id'    => 'nullable|exists:demandes_import,id',
            'date_expiration' => 'nullable|date|after:today',
        ];
    }
}
